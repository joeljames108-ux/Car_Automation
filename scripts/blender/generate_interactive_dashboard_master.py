"""
==============================================================================
AUTOMOTIVE INTERACTIVE DASHBOARD MASTER CAD GENERATOR (BLENDER 5.2 LTS)
==============================================================================
Creates a production-quality automotive interior configurator asset with:
- True Class-A curved continuous automotive surfaces & realistic proportions.
- Ergonomically calibrated packaging from Driver H-point outward.
- Top-level COCKPIT_MASTER semantic hierarchy:
  * CABIN (curved raked windshield, A-pillars, rear bulkhead, frameless mirror, roof liner, dome console)
  * DASHBOARD (continuous sculpted upper cowl, driver binnacle, passenger sweep, trim spear, glovebox, knee bolsters, French stitching, defrost vents)
  * STEERING (7 modular wheels: Sport 3-Spoke, GT 3-Spoke, GT3 Yoke, Formula, Luxury 2-Spoke, Classic 4-Spoke, Performance 4-Spoke)
  * INFOTAINMENT (recessed 12.8-inch widescreen, bezel, tactile climate control stack, push start button, hazard button)
  * CLUSTER (hooded binnacle, digital screen, speedo & tacho gauges with needles, HUD projection plane)
  * HVAC (center dual louvers with chrome bezels and sliders, outboard vents)
  * CENTER_CONSOLE (sculpted tapering bridge, walnut/carbon top plate, padded knee bolsters, armrest, dual cupholders, MMI knob, EPB switch)
  * SHIFTER (7 modular selectors: Auto Lever, Gated Manual, H-Pattern Manual, Toggle Rocker, Rotary Dial, Crystal Selector, Performance Lever)
  * DOORS (left and right sculpted door cards with armrests, chrome handles, speakers, ambient LED strips)
  * SEATS (driver & passenger contoured bucket seats, headrests, buckles, color-coded seat belts)
  * LIGHTING (discrete ambient LED light guides for dash, doors, console, footwells)
  * CONTROLS (driver footwell aluminum pedals: throttle, brake, dead pedal)
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[INTERACTIVE_DASH_CAD] {msg}")

def reset_scene_clean():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def set_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0, sheen=0.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")

    set_socket(bsdf, ["Base Color"], base_color)
    set_socket(bsdf, ["Metallic"], metallic)
    set_socket(bsdf, ["Roughness"], roughness)

    if clearcoat > 0:
        set_socket(bsdf, ["Coat Weight", "Clearcoat"], clearcoat)
        set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], clearcoat_rough)

    if sheen > 0:
        set_socket(bsdf, ["Sheen Weight", "Sheen"], sheen)

    if transmission > 0:
        set_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_socket(bsdf, ["IOR"], ior)
        mat.blend_method = 'BLEND'

    if alpha < 1.0:
        set_socket(bsdf, ["Alpha"], alpha)
        mat.blend_method = 'BLEND'

    if emission:
        set_socket(bsdf, ["Emission Color", "Emission"], emission)
        set_socket(bsdf, ["Emission Strength"], emission_strength)

    return mat

def make_textured_mat(name, img_path, roughness=0.15, clearcoat=0.6, emission_factor=0.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    tex_node = tree.nodes.new(type="ShaderNodeTexImage")
    tex_node.location = (-400, 0)

    if os.path.exists(img_path):
        img = bpy.data.images.load(img_path, check_existing=True)
        tex_node.image = img
        tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
        if emission_factor > 0:
            set_socket(bsdf, ["Emission Color", "Emission"], (1.0, 1.0, 1.0, 1.0))
            tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Emission Color" if "Emission Color" in bsdf.inputs else "Emission"])
            set_socket(bsdf, ["Emission Strength"], emission_factor)

    set_socket(bsdf, ["Roughness"], roughness)
    set_socket(bsdf, ["Coat Weight", "Clearcoat"], clearcoat)
    return mat

def create_cad_materials():
    tex_dir = os.path.abspath("public/models/interior/textures")

    mats = {}
    # Dark High-Contrast Default Leathers & Soft Touch (prevents white clipping)
    mats["dash_upper_pad"] = make_pbr_mat("Mat_Dash_UpperPad_Obsidian", (0.018, 0.019, 0.022, 1.0), metallic=0.01, roughness=0.52, sheen=0.3)
    mats["dash_main_cognac"] = make_pbr_mat("Mat_Dash_MainBody_Cognac", (0.035, 0.036, 0.040, 1.0), metallic=0.02, roughness=0.55, sheen=0.2)
    mats["charcoal_trim"] = make_pbr_mat("Mat_Charcoal_SoftTouch", (0.024, 0.025, 0.028, 1.0), metallic=0.04, roughness=0.58)
    mats["leather_ebony"] = make_pbr_mat("Mat_Nappa_Ebony", (0.014, 0.015, 0.018, 1.0), metallic=0.01, roughness=0.45, sheen=0.35)
    mats["headliner_alcantara"] = make_pbr_mat("Mat_Headliner_Alcantara", (0.025, 0.026, 0.029, 1.0), roughness=0.88, sheen=0.45)

    # Stitching & Accents
    mats["stitch_gold"] = make_pbr_mat("Mat_Stitch_Gold", (0.88, 0.62, 0.12, 1.0), roughness=0.45)
    mats["stitch_red"] = make_pbr_mat("Mat_Stitch_Red", (0.85, 0.08, 0.08, 1.0), roughness=0.45)
    mats["seatbelt_red"] = make_pbr_mat("Mat_Seatbelt_Red", (0.80, 0.08, 0.08, 1.0), roughness=0.60)

    # Emissive Guides (restrained intensity so geometry is sculpted by shadow, not blown out)
    mats["ambient_cyan"] = make_pbr_mat("Mat_Ambient_Cyan_Neon", (0.0, 0.70, 0.95, 1.0), emission=(0.0, 0.70, 0.95, 1.0), emission_strength=4.5)
    mats["gauge_needle_red"] = make_pbr_mat("Mat_Gauge_Needle_Red", (0.95, 0.08, 0.08, 1.0), emission=(0.95, 0.08, 0.08, 1.0), emission_strength=4.0)
    mats["hud_cyan"] = make_pbr_mat("Mat_HUD_Cyan", (0.05, 0.85, 0.75, 0.65), emission=(0.05, 0.85, 0.75, 1.0), emission_strength=4.0, alpha=0.65)

    # Metals & Synthetics
    mats["piano_black"] = make_pbr_mat("Mat_Piano_Black", (0.005, 0.005, 0.007, 1.0), roughness=0.04, clearcoat=0.95)
    mats["aluminum_brushed"] = make_pbr_mat("Mat_Aluminum_Brushed", (0.84, 0.85, 0.88, 1.0), metallic=0.95, roughness=0.20)
    mats["chrome_mirror"] = make_pbr_mat("Mat_Chrome_Jewel", (0.92, 0.93, 0.95, 1.0), metallic=0.98, roughness=0.03, clearcoat=0.9)
    mats["titanium_matte"] = make_pbr_mat("Mat_Titanium_Satin", (0.50, 0.53, 0.58, 1.0), metallic=0.90, roughness=0.25)
    mats["rubber_traction"] = make_pbr_mat("Mat_Rubber_Black", (0.015, 0.015, 0.018, 1.0), roughness=0.92)
    mats["glass_optical"] = make_pbr_mat("Mat_Glass_Optical", (0.02, 0.02, 0.03, 0.12), roughness=0.02, transmission=0.95, ior=1.52, alpha=0.12)
    mats["crystal_faceted"] = make_pbr_mat("Mat_Crystal_Faceted", (0.90, 0.94, 0.98, 0.6), roughness=0.03, clearcoat=1.0, transmission=0.85, ior=1.65, alpha=0.6)

    # Textured Maps
    path_wood = os.path.join(tex_dir, "wood_walnut_grain.png")
    path_carbon = os.path.join(tex_dir, "carbon_twill_weave.png")
    path_perf = os.path.join(tex_dir, "leather_perforated_pattern.png")
    path_spk = os.path.join(tex_dir, "speaker_grille_acoustic.png")
    path_nav = os.path.join(tex_dir, "infotainment_navigation_ui.png")
    path_mid = os.path.join(tex_dir, "cluster_center_mid.png")
    path_spd = os.path.join(tex_dir, "gauge_speedo_face.png")
    path_tch = os.path.join(tex_dir, "gauge_tacho_face.png")
    path_badge = os.path.join(tex_dir, "steering_crest_badge.png")
    path_prnd = os.path.join(tex_dir, "shifter_prnd_panel.png")

    mats["wood_walnut"] = make_textured_mat("Mat_InteriorTrim_Walnut", path_wood, roughness=0.18, clearcoat=0.85)
    mats["carbon_twill"] = make_textured_mat("Mat_Carbon_Twill_3K", path_carbon, roughness=0.12, clearcoat=0.90)
    mats["leather_perforated"] = make_textured_mat("Mat_Leather_Perforated", path_perf, roughness=0.45, clearcoat=0.2)
    mats["speaker_acoustic"] = make_textured_mat("Mat_Speaker_Acoustic", path_spk, roughness=0.25, clearcoat=0.4)
    mats["screen_infotainment"] = make_textured_mat("Mat_Infotainment_Display", path_nav, roughness=0.04, clearcoat=0.9, emission_factor=0.85)
    mats["screen_cluster"] = make_textured_mat("Mat_Cluster_Display", path_mid, roughness=0.04, clearcoat=0.8, emission_factor=0.85)
    mats["gauge_speedo"] = make_textured_mat("Mat_Gauge_Speedo_Face", path_spd, roughness=0.04, clearcoat=0.8, emission_factor=0.80)
    mats["gauge_tacho"] = make_textured_mat("Mat_Gauge_Tacho_Face", path_tch, roughness=0.04, clearcoat=0.8, emission_factor=0.80)
    mats["shifter_prnd"] = make_textured_mat("Mat_Shifter_PRND_Panel", path_prnd, roughness=0.05, clearcoat=0.9, emission_factor=0.80)
    mats["steering_badge"] = make_textured_mat("Mat_Steering_Badge_Crest", path_badge, roughness=0.10, clearcoat=0.9, emission_factor=0.15)

    return mats

def attach_to_parent(obj, parent):
    if parent is None or obj is None:
        return
    bpy.context.view_layer.update()
    obj.parent = parent
    obj.matrix_parent_inverse = parent.matrix_world.inverted()

def make_box(name, location, size, mat, rot_euler=(0, 0, 0), bevel=0.003, segments=2, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and min(size) > bevel * 2.1:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, min(size) * 0.25)
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, mat, vertices=32, bevel=0.002, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and depth > bevel * 2.2 and radius > bevel * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, radius * 0.25)
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(45)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_torus(name, location, major_radius, minor_radius, rot_euler, mat, major_segments=48, minor_segments=24, parent=None):
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        rotation=rot_euler,
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=major_segments,
        minor_segments=minor_segments
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_knurled_cylinder(name, location, radius, depth, rot_euler, mat=None, ridges=24, ridge_depth_ratio=0.08, parent=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_pts = ridges * 2
    half_d = depth / 2.0
    verts_bottom = []
    verts_top = []
    for i in range(n_pts):
        angle = (2.0 * math.pi * i) / n_pts
        r = radius if (i % 2 == 0) else radius * (1.0 - ridge_depth_ratio)
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        verts_bottom.append(bm.verts.new((x, y, -half_d)))
        verts_top.append(bm.verts.new((x, y, half_d)))
    bm.verts.ensure_lookup_table()
    for i in range(n_pts):
        next_i = (i + 1) % n_pts
        bm.faces.new([verts_bottom[i], verts_bottom[next_i], verts_top[next_i], verts_top[i]])
    bm.faces.new(verts_bottom[::-1])
    bm.faces.new(verts_top)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rot_euler
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def unwrap_planar_uv(obj):
    me = obj.data
    uv_layer = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    min_x = min(v.co.x for v in me.vertices)
    max_x = max(v.co.x for v in me.vertices)
    min_z = min(v.co.z for v in me.vertices)
    max_z = max(v.co.z for v in me.vertices)
    dx = max_x - min_x if max_x > min_x else 1.0
    dz = max_z - min_z if max_z > min_z else 1.0
    for poly in me.polygons:
        for loop_idx in poly.loop_indices:
            v_idx = me.loops[loop_idx].vertex_index
            vx = me.vertices[v_idx].co.x
            vz = me.vertices[v_idx].co.z
            u = (vx - min_x) / dx
            v = (vz - min_z) / dz
            uv_layer.data[loop_idx].uv = (u, v)

def unwrap_tilted_dial_uv(obj, radius, rot_euler):
    me = obj.data
    uv_layer = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    R_inv = Euler(rot_euler).to_matrix().to_4x4().inverted()
    for poly in me.polygons:
        for loop_idx in poly.loop_indices:
            v_idx = me.loops[loop_idx].vertex_index
            v_world = me.vertices[v_idx].co
            loc = R_inv @ (v_world - obj.location)
            u = 0.5 + (loc.x / (2.0 * radius))
            v = 0.5 + (loc.y / (2.0 * radius))
            uv_layer.data[loop_idx].uv = (max(0.0, min(1.0, u)), max(0.0, min(1.0, v)))

def unwrap_horizontal_strip_uv(obj):
    me = obj.data
    uv_layer = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    min_x = min(v.co.x for v in me.vertices)
    max_x = max(v.co.x for v in me.vertices)
    min_z = min(v.co.z for v in me.vertices)
    max_z = max(v.co.z for v in me.vertices)
    dx = max_x - min_x if max_x > min_x else 1.0
    dz = max_z - min_z if max_z > min_z else 1.0
    for poly in me.polygons:
        for loop_idx in poly.loop_indices:
            v_idx = me.loops[loop_idx].vertex_index
            vx = me.vertices[v_idx].co.x
            vz = me.vertices[v_idx].co.z
            u = (vx - min_x) / dx
            v = (vz - min_z) / dz
            uv_layer.data[loop_idx].uv = (u, v)

def unwrap_console_top_uv(obj):
    me = obj.data
    uv_layer = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    min_x = min(v.co.x for v in me.vertices)
    max_x = max(v.co.x for v in me.vertices)
    min_y = min(v.co.y for v in me.vertices)
    max_y = max(v.co.y for v in me.vertices)
    dx = max_x - min_x if max_x > min_x else 1.0
    dy = max_y - min_y if max_y > min_y else 1.0
    for poly in me.polygons:
        for loop_idx in poly.loop_indices:
            v_idx = me.loops[loop_idx].vertex_index
            vx = me.vertices[v_idx].co.x
            vy = me.vertices[v_idx].co.y
            u = (vx - min_x) / dx
            v = (vy - min_y) / dy
            uv_layer.data[loop_idx].uv = (u, v)

# ==============================================================================
# CLASS-A SCULPTED PROCEDURAL BUILDERS (BMESH)
# ==============================================================================

def make_sculpted_curved_mesh(name, slices, mat=None, parent=None):
    """
    Creates a smooth continuous lofted 3D mesh from a list of cross-sectional slices.
    Each slice is a list of Vector3 vertices ordered counter-clockwise.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    grid = []
    for s in slices:
        row = [bm.verts.new(pt) for pt in s]
        grid.append(row)
    bm.verts.ensure_lookup_table()

    n_slices = len(slices)
    pts_per_slice = len(slices[0])

    for i in range(n_slices - 1):
        for j in range(pts_per_slice - 1):
            v1 = grid[i][j]
            v2 = grid[i][j+1]
            v3 = grid[i+1][j+1]
            v4 = grid[i+1][j]
            bm.faces.new([v1, v2, v3, v4])
        # Close loop if loopable
        v1 = grid[i][pts_per_slice - 1]
        v2 = grid[i][0]
        v3 = grid[i+1][0]
        v4 = grid[i+1][pts_per_slice - 1]
        bm.faces.new([v1, v2, v3, v4])

    # End caps
    bm.faces.new(grid[0])
    bm.faces.new(grid[-1][::-1])

    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def make_sculpted_steering_rim(name, steer_pos, steer_rot, rim_r=0.175, tube_r=0.015, is_flat_bottom=False, mat=None, parent=None):
    """
    Constructs an authentic ergonomic steering rim with anatomical palm swells,
    thumb indents at 10-and-2 o'clock, and optional D-cut flat bottom.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    n_steps = 48
    pts_per_ring = 16
    R_mat = Euler(steer_rot).to_matrix().to_4x4()

    rings = []
    for i in range(n_steps):
        theta = (2.0 * math.pi * i) / n_steps
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)

        # Base radius & ergonomic modulation
        curr_r = rim_r
        # Flat bottom between 240° and 300° (bottom sector)
        if is_flat_bottom and -0.92 < sin_t < -0.3 and cos_t**2 < 0.8:
            curr_r = rim_r * (0.84 + 0.16 * (1.0 - abs(sin_t)))

        # Anatomical thumb rests around 10 o'clock (150°) and 2 o'clock (30°)
        thumb_bump = 0.0
        if 0.3 < sin_t < 0.95:
            thumb_bump = 0.005 * math.exp(-((abs(cos_t) - 0.75)**2) / 0.04)

        center_pt = Vector((cos_t * (curr_r + thumb_bump), sin_t * (curr_r + thumb_bump), 0.0))

        # Cross section with oval thickness
        rad_x = (tube_r + thumb_bump * 0.8) * 1.12
        rad_z = tube_r * 0.95

        ring_verts = []
        for j in range(pts_per_ring):
            phi = (2.0 * math.pi * j) / pts_per_ring
            # Local cross-section point aligned with rim tangent
            nx = cos_t * math.cos(phi) * rad_x
            ny = sin_t * math.cos(phi) * rad_x
            nz = math.sin(phi) * rad_z
            local_p = center_pt + Vector((nx, ny, nz))
            world_p = steer_pos + R_mat @ local_p
            ring_verts.append(bm.verts.new(world_p))
        rings.append(ring_verts)

    bm.verts.ensure_lookup_table()
    for i in range(n_steps):
        next_i = (i + 1) % n_steps
        for j in range(pts_per_ring):
            next_j = (j + 1) % pts_per_ring
            v1 = rings[i][j]
            v2 = rings[i][next_j]
            v3 = rings[next_i][next_j]
            v4 = rings[next_i][j]
            bm.faces.new([v1, v2, v3, v4])

    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def build_class_a_interactive_dashboard():
    log("Building Master Class-A Automotive Cockpit with Continuous Ergonomic Surfaces...")
    reset_scene_clean()
    mats = create_cad_materials()

    # ------------------------------------------------------------------------
    # TOP-LEVEL ROOT: COCKPIT_MASTER
    # ------------------------------------------------------------------------
    cockpit_master = bpy.data.objects.new("COCKPIT_MASTER", None)
    bpy.context.scene.collection.objects.link(cockpit_master)

    dash_w = 1.52 # Full interior cabin width
    driver_x = -0.38 # Driver center axis (LHD)
    pass_x = 0.38 # Passenger center axis

    # ------------------------------------------------------------------------
    # 1. CABIN BRANCH
    # ------------------------------------------------------------------------
    log("1. Modeling CABIN branch with curved greenhouse glazing...")
    cabin_group = bpy.data.objects.new("CABIN", None)
    bpy.context.scene.collection.objects.link(cabin_group)
    attach_to_parent(cabin_group, cockpit_master)

    # Roof Headliner in dark charcoal Alcantara (contoured with recess)
    make_box("CABIN_ROOF_LINER", (0.0, -0.40, 1.25), (dash_w * 1.02, 1.30, 0.04), mats["headliner_alcantara"], bevel=0.015, parent=cabin_group)
    # Overhead Center Dome Light Console & Reading Lamps
    make_box("CABIN_DOME_CONSOLE", (0.0, -0.16, 1.222), (0.19, 0.24, 0.024), mats["piano_black"], bevel=0.005, parent=cabin_group)
    make_cylinder("DOME_LAMP_L", (-0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_cylinder("DOME_LAMP_R", (0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_box("DOME_SUNGLASS_HATCH", (0.0, -0.22, 1.218), (0.12, 0.06, 0.012), mats["charcoal_trim"], bevel=0.002, parent=cabin_group)
    # Rear Cabin Bulkhead Partition
    make_box("CABIN_REAR_BULKHEAD", (0.0, -1.05, 0.65), (dash_w * 1.02, 0.045, 1.18), mats["charcoal_trim"], bevel=0.012, parent=cabin_group)

    # Outer Left & Right A-Pillars in dark Alcantara headliner fabric
    apillar_rot_l = Euler((math.radians(-35), math.radians(15), 0), 'XYZ')
    make_box("A_PILLAR_L", (-dash_w * 0.48, 0.16, 0.90), (0.058, 0.078, 0.54), mats["headliner_alcantara"], rot_euler=apillar_rot_l, bevel=0.012, parent=cabin_group)
    apillar_rot_r = Euler((math.radians(-35), math.radians(-15), 0), 'XYZ')
    make_box("A_PILLAR_R", (dash_w * 0.48, 0.16, 0.90), (0.058, 0.078, 0.54), mats["headliner_alcantara"], rot_euler=apillar_rot_r, bevel=0.012, parent=cabin_group)
    # High-Frequency Audio Tweeter Grilles in base of A-pillars
    make_cylinder("TWEETER_GRILLE_L", (-dash_w * 0.46, 0.02, 0.77), 0.022, 0.008, (math.radians(45), math.radians(25), 0), mats["aluminum_brushed"], vertices=24, parent=cabin_group)
    make_cylinder("TWEETER_GRILLE_R", (dash_w * 0.46, 0.02, 0.77), 0.022, 0.008, (math.radians(45), math.radians(-25), 0), mats["aluminum_brushed"], vertices=24, parent=cabin_group)

    # Raked Curved Windshield Glass
    windshield_rot = Euler((math.radians(-35), 0, 0), 'XYZ')
    make_box("CABIN_WINDSHIELD_AND_MIRROR", (0.0, 0.24, 0.94), (dash_w * 0.96, 0.008, 0.60), mats["glass_optical"], rot_euler=windshield_rot, bevel=0, parent=cabin_group)

    # Frameless Electrochromic Rearview Mirror
    make_cylinder("MIRROR_BALL_STALK", (0.0, 0.09, 1.07), 0.008, 0.075, (math.radians(45), 0, 0), mats["titanium_matte"], vertices=16, parent=cabin_group)
    make_box("MIRROR_FRAMELESS_HOUSING", (0.0, 0.035, 1.04), (0.24, 0.020, 0.065), mats["piano_black"], bevel=0.004, parent=cabin_group)
    make_box("MIRROR_REFLECTIVE_GLASS", (0.0, 0.022, 1.04), (0.234, 0.004, 0.058), mats["chrome_mirror"], bevel=0.001, parent=cabin_group)

    # Sun Visors
    make_box("SUN_VISOR_L", (driver_x, 0.02, 1.10), (0.34, 0.14, 0.014), mats["headliner_alcantara"], bevel=0.003, parent=cabin_group)
    make_box("SUN_VISOR_R", (pass_x, 0.02, 1.10), (0.34, 0.14, 0.014), mats["headliner_alcantara"], bevel=0.003, parent=cabin_group)

    # Exterior Side Mirrors (visible through front door quarter glass / outside A-pillars)
    for sm_side, sm_x, sm_rot_z in [("L", -dash_w * 0.58, math.radians(14)), ("R", dash_w * 0.58, math.radians(-14))]:
        stalk_rot = Euler((math.radians(10), 0, sm_rot_z), 'XYZ')
        make_cylinder(f"SIDE_MIRROR_STALK_{sm_side}", (sm_x * 0.90, 0.08, 0.74), 0.012, 0.12, stalk_rot, mats["titanium_matte"], vertices=16, parent=cabin_group)
        housing_rot = Euler((math.radians(5), 0, sm_rot_z), 'XYZ')
        make_box(f"SIDE_MIRROR_HOUSING_{sm_side}", (sm_x, 0.12, 0.77), (0.18, 0.10, 0.11), mats["piano_black"], rot_euler=housing_rot, bevel=0.014, parent=cabin_group)
        glass_rot = Euler((math.radians(4), math.radians(6 if sm_side == "L" else -6), sm_rot_z), 'XYZ')
        make_box(f"SIDE_MIRROR_GLASS_{sm_side}", (sm_x * 0.985, 0.08, 0.77), (0.165, 0.006, 0.095), mats["chrome_mirror"], rot_euler=glass_rot, bevel=0.002, parent=cabin_group)
        make_box(f"SIDE_MIRROR_BEZEL_{sm_side}", (sm_x * 0.985, 0.082, 0.77), (0.172, 0.008, 0.102), mats["charcoal_trim"], rot_euler=glass_rot, bevel=0.002, parent=cabin_group)

    # ------------------------------------------------------------------------
    # 2. DASHBOARD BRANCH (Sculpted Wing Across Cabin)
    # ------------------------------------------------------------------------
    log("2. Modeling DASHBOARD branch with continuous curved wing architecture...")
    dash_group = bpy.data.objects.new("DASHBOARD", None)
    bpy.context.scene.collection.objects.link(dash_group)
    attach_to_parent(dash_group, cockpit_master)

    # 2.1 Continuous Curved Upper Pad (Spanning Width)
    make_box("DASH_UPPER_PAD", (0.0, 0.16, 0.745), (dash_w, 0.44, 0.052), mats["dash_upper_pad"], bevel=0.018, parent=dash_group)
    # Driver Arched Instrument Binnacle Cowl
    make_box("DASH_UPPER_COWL_BINNACLE", (driver_x, 0.02, 0.812), (0.42, 0.32, 0.055), mats["dash_upper_pad"], bevel=0.022, parent=dash_group)
    # Passenger Sculpted Concave Sweep
    make_box("DASH_UPPER_PASS_SWEEP", (pass_x, 0.14, 0.765), (0.54, 0.38, 0.045), mats["dash_upper_pad"], bevel=0.016, parent=dash_group)

    # Double French Seam Stitching running along the leather brow
    make_box("DASH_COWL_STITCH_L", (driver_x, -0.075, 0.822), (0.40, 0.003, 0.003), mats["stitch_gold"], bevel=0, parent=dash_group)
    make_box("DASH_COWL_STITCH_PASS", (pass_x, 0.008, 0.778), (0.50, 0.003, 0.003), mats["stitch_gold"], bevel=0, parent=dash_group)

    # Central Acoustic Audio Speaker Grille
    spk_obj = make_cylinder("DASH_SPEAKER_GRILLE", (0.0, 0.18, 0.776), 0.068, 0.004, (0, 0, 0), mats["speaker_acoustic"], vertices=36, parent=dash_group)
    unwrap_console_top_uv(spk_obj)
    make_cylinder("DASH_SPEAKER_CHROME_RIM", (0.0, 0.18, 0.778), 0.070, 0.003, (0, 0, 0), mats["chrome_mirror"], vertices=36, bevel=0.001, parent=dash_group)

    # Windshield Defrost Vents
    for vx in [-0.50, -0.25, 0.0, 0.25, 0.50]:
        make_box(f"DASH_DEFROST_VENT_{vx}", (vx, 0.33, 0.775), (0.17, 0.024, 0.008), mats["charcoal_trim"], bevel=0.001, parent=dash_group)
    make_cylinder("DASH_SUN_SENSOR", (0.0, 0.30, 0.782), 0.012, 0.010, (0, 0, 0), mats["piano_black"], vertices=20, bevel=0.002, parent=dash_group)

    # Lower Body, Glovebox, & Knee Bolsters
    make_box("DASH_MAIN_BODY", (0.0, 0.14, 0.61), (dash_w * 0.98, 0.35, 0.24), mats["dash_main_cognac"], bevel=0.020, parent=dash_group)
    make_box("DASH_GLOVEBOX_PANEL", (pass_x, -0.045, 0.55), (0.51, 0.035, 0.19), mats["dash_main_cognac"], bevel=0.008, parent=dash_group)
    make_box("DASH_GLOVEBOX_HANDLE", (pass_x - 0.16, -0.065, 0.61), (0.048, 0.012, 0.018), mats["chrome_mirror"], bevel=0.002, parent=dash_group)
    make_cylinder("DASH_GLOVEBOX_LOCK", (pass_x - 0.16, -0.068, 0.61), 0.005, 0.006, (math.radians(90), 0, 0), mats["titanium_matte"], vertices=16, parent=dash_group)
    make_box("DASH_GLOVEBOX_SEAM", (pass_x, -0.048, 0.55), (0.52, 0.003, 0.20), mats["charcoal_trim"], bevel=0, parent=dash_group)
    make_box("DASH_DRIVER_KNEE_BOLSTER", (driver_x, -0.045, 0.53), (0.45, 0.035, 0.17), mats["charcoal_trim"], bevel=0.008, parent=dash_group)

    # Decorative Trim Spear Across Dashboard
    trim_spear_obj = make_box("DASH_TRIM_SPEAR", (0.0, -0.045, 0.705), (dash_w * 0.96, 0.036, 0.065), mats["wood_walnut"], bevel=0.006, parent=dash_group)
    unwrap_horizontal_strip_uv(trim_spear_obj)
    make_box("DASH_TRIM_CHROME_LIP", (0.0, -0.060, 0.670), (dash_w * 0.96, 0.012, 0.006), mats["chrome_mirror"], bevel=0.002, parent=dash_group)

    # ------------------------------------------------------------------------
    # 3. HVAC BRANCH (Central & Outboard Louvers)
    # ------------------------------------------------------------------------
    log("3. Modeling HVAC branch with turbine & dual-louver vanes...")
    hvac_group = bpy.data.objects.new("HVAC", None)
    bpy.context.scene.collection.objects.link(hvac_group)
    attach_to_parent(hvac_group, cockpit_master)

    make_box("DASH_HVAC_CENTER_HOUSING", (0.0, -0.058, 0.722), (0.34, 0.026, 0.056), mats["piano_black"], bevel=0.004, parent=hvac_group)
    for c_i, cx in enumerate([-0.085, 0.085]):
        make_box(f"DASH_HVAC_FRAME_{c_i+1}", (cx, -0.068, 0.722), (0.15, 0.012, 0.046), mats["chrome_mirror"], bevel=0.003, parent=hvac_group)
        make_box(f"DASH_HVAC_DUCT_{c_i+1}", (cx, -0.062, 0.722), (0.138, 0.015, 0.036), mats["charcoal_trim"], bevel=0, parent=hvac_group)
        for l_i, lz in enumerate([-0.012, -0.004, 0.004, 0.012]):
            make_box(f"DASH_HVAC_SLAT_{c_i+1}_{l_i+1}", (cx, -0.070, 0.722 + lz), (0.132, 0.008, 0.003), mats["aluminum_brushed"], bevel=0, parent=hvac_group)
        make_box(f"DASH_HVAC_SLIDER_{c_i+1}", (cx, -0.075, 0.722), (0.014, 0.006, 0.014), mats["chrome_mirror"], bevel=0.001, parent=hvac_group)

    # Outboard Driver & Passenger Vents
    make_box("DASH_HVAC_VENTS", (-dash_w * 0.44, 0.02, 0.72), (0.09, 0.03, 0.052), mats["charcoal_trim"], bevel=0.004, parent=hvac_group)
    make_box("DASH_HVAC_FRAME_L", (-dash_w * 0.44, -0.016, 0.72), (0.096, 0.012, 0.056), mats["chrome_mirror"], bevel=0.002, parent=hvac_group)
    make_box("DASH_HVAC_VENT_PASS", (dash_w * 0.44, 0.02, 0.72), (0.09, 0.03, 0.052), mats["charcoal_trim"], bevel=0.004, parent=hvac_group)
    make_box("DASH_HVAC_FRAME_R", (dash_w * 0.44, -0.016, 0.72), (0.096, 0.012, 0.056), mats["chrome_mirror"], bevel=0.002, parent=hvac_group)

    # ------------------------------------------------------------------------
    # 4. INFOTAINMENT BRANCH (Embedded Center Display & Climate Controls)
    # ------------------------------------------------------------------------
    log("4. Modeling INFOTAINMENT branch...")
    info_group = bpy.data.objects.new("INFOTAINMENT", None)
    bpy.context.scene.collection.objects.link(info_group)
    attach_to_parent(info_group, cockpit_master)

    # Recessed 12.8" Display angled slightly toward driver (4° tilt)
    screen_rot = Euler((math.radians(10), math.radians(4), 0), 'XYZ')
    make_box("INFOTAINMENT_BEZEL", (0.01, -0.065, 0.58), (0.37, 0.022, 0.225), mats["piano_black"], rot_euler=screen_rot, bevel=0.006, parent=info_group)
    make_box("INFOTAINMENT_CHROME_FRAME", (0.01, -0.076, 0.58), (0.352, 0.008, 0.208), mats["aluminum_brushed"], rot_euler=screen_rot, bevel=0.002, parent=info_group)
    screen_obj = make_box("INFOTAINMENT_SCREEN", (0.01, -0.080, 0.58), (0.344, 0.006, 0.200), mats["screen_infotainment"], rot_euler=screen_rot, bevel=0, parent=info_group)
    unwrap_planar_uv(screen_obj)

    # Climate Control Tactile Bar
    make_box("DASH_CLIMATE_BAR", (0.0, -0.082, 0.455), (0.32, 0.024, 0.046), mats["charcoal_trim"], bevel=0.003, parent=info_group)
    make_knurled_cylinder("DASH_CLIMATE_KNOB_L", (-0.09, -0.094, 0.455), 0.016, 0.015, (math.radians(90), 0, 0), mats["chrome_mirror"], ridges=24, parent=info_group)
    make_cylinder("DASH_CLIMATE_DISP_L", (-0.09, -0.102, 0.455), 0.010, 0.002, (math.radians(90), 0, 0), mats["piano_black"], vertices=20, parent=info_group)
    make_knurled_cylinder("DASH_CLIMATE_KNOB_R", (0.09, -0.094, 0.455), 0.016, 0.015, (math.radians(90), 0, 0), mats["chrome_mirror"], ridges=24, parent=info_group)
    make_cylinder("DASH_CLIMATE_DISP_R", (0.09, -0.102, 0.455), 0.010, 0.002, (math.radians(90), 0, 0), mats["piano_black"], vertices=20, parent=info_group)
    make_box("DASH_HAZARD_BUTTON", (0.0, -0.094, 0.455), (0.020, 0.008, 0.018), mats["gauge_needle_red"], bevel=0.001, parent=info_group)
    for sw_i, sw_x in enumerate([-0.045, -0.022, 0.022, 0.045]):
        make_box(f"DASH_CLIMATE_TOGGLE_{sw_i+1}", (sw_x, -0.094, 0.455), (0.012, 0.010, 0.014), mats["aluminum_brushed"], bevel=0.001, parent=info_group)

    # Push-to-Start Button with Illuminated Ring
    make_knurled_cylinder("DASH_START_BUTTON_BEZEL", (driver_x + 0.22, -0.068, 0.65), 0.018, 0.010, (math.radians(90), 0, 0), mats["chrome_mirror"], ridges=24, parent=info_group)
    make_cylinder("DASH_START_BUTTON", (driver_x + 0.22, -0.075, 0.65), 0.014, 0.006, (math.radians(90), 0, 0), mats["piano_black"], vertices=24, parent=info_group)
    make_cylinder("DASH_START_HALO", (driver_x + 0.22, -0.074, 0.65), 0.0155, 0.002, (math.radians(90), 0, 0), mats["ambient_cyan"], vertices=24, parent=info_group)

    # ------------------------------------------------------------------------
    # 5. CLUSTER BRANCH & HUD (Located directly behind steering wheel)
    # ------------------------------------------------------------------------
    log("5. Modeling CLUSTER branch with deep hood & HUD...")
    cluster_group = bpy.data.objects.new("CLUSTER", None)
    bpy.context.scene.collection.objects.link(cluster_group)
    attach_to_parent(cluster_group, cockpit_master)

    # Binnacle Hood shading the instrument cluster
    make_box("CLUSTER_HOOD", (driver_x, 0.01, 0.745), (0.39, 0.17, 0.14), mats["charcoal_trim"], bevel=0.014, parent=cluster_group)
    cluster_scr = make_box("CLUSTER_SCREEN", (driver_x, -0.078, 0.735), (0.33, 0.008, 0.105), mats["screen_cluster"], bevel=0, parent=cluster_group)
    unwrap_planar_uv(cluster_scr)

    # Dual Analog Gauges positioned behind the wheel aperture
    dial_r = 0.052
    speedo_pos = Vector((driver_x - 0.095, -0.082, 0.735))
    make_cylinder("CLUSTER_BEZEL_SPEEDO", speedo_pos, dial_r + 0.006, 0.014, (math.radians(82), 0, 0), mats["chrome_mirror"], vertices=36, bevel=0.002, parent=cluster_group)
    speedo_face = make_cylinder("CLUSTER_DIAL_SPEEDO", speedo_pos + Vector((0, -0.004, 0)), dial_r - 0.002, 0.002, (math.radians(82), 0, 0), mats["gauge_speedo"], vertices=36, parent=cluster_group)
    unwrap_tilted_dial_uv(speedo_face, dial_r - 0.002, (math.radians(82), 0, 0))
    needle_speed_rot = Euler((math.radians(82), math.radians(-35), 0))
    make_box("CLUSTER_NEEDLE_SPEEDO", speedo_pos + Vector((0.014, -0.006, 0.012)), (0.0025, 0.0025, 0.034), mats["gauge_needle_red"], rot_euler=needle_speed_rot, bevel=0, parent=cluster_group)

    tacho_pos = Vector((driver_x + 0.095, -0.082, 0.735))
    make_cylinder("CLUSTER_BEZEL_TACHO", tacho_pos, dial_r + 0.006, 0.014, (math.radians(82), 0, 0), mats["chrome_mirror"], vertices=36, bevel=0.002, parent=cluster_group)
    tacho_face = make_cylinder("CLUSTER_DIAL_TACHO", tacho_pos + Vector((0, -0.004, 0)), dial_r - 0.002, 0.002, (math.radians(82), 0, 0), mats["gauge_tacho"], vertices=36, parent=cluster_group)
    unwrap_tilted_dial_uv(tacho_face, dial_r - 0.002, (math.radians(82), 0, 0))
    needle_tacho_rot = Euler((math.radians(82), math.radians(20), 0))
    make_box("CLUSTER_NEEDLE_TACHO", tacho_pos + Vector((-0.010, -0.006, 0.015)), (0.0025, 0.0025, 0.034), mats["gauge_needle_red"], rot_euler=needle_tacho_rot, bevel=0, parent=cluster_group)

    # Head-Up Display (HUD) projection plane on lower windshield
    hud_pos = Vector((driver_x, 0.18, 0.90))
    hud_plane = make_box("HUD_PROJECTION_PLANE", hud_pos, (0.24, 0.002, 0.14), mats["hud_cyan"], rot_euler=Euler((math.radians(-35), 0, 0)), bevel=0, parent=cluster_group)
    unwrap_planar_uv(hud_plane)

    # ------------------------------------------------------------------------
    # 6. STEERING BRANCH (7 Modular Wheels with Ergonomic Rims)
    # ------------------------------------------------------------------------
    log("6. Modeling STEERING branch with 7 sculpted ergonomic wheels...")
    steering_group = bpy.data.objects.new("STEERING", None)
    bpy.context.scene.collection.objects.link(steering_group)
    attach_to_parent(steering_group, cockpit_master)

    steer_pos = Vector((driver_x, -0.24, 0.66))
    steer_rot = Euler((math.radians(78), 0, 0))
    R_steer = Matrix.Rotation(math.radians(78), 4, 'X')

    def steer_world(local_vec):
        return steer_pos + R_steer @ local_vec

    # Column & Stalks
    col_pos = steer_pos + Vector((0.0, 0.09, -0.018))
    make_cylinder("STEERING_COLUMN_AND_STALKS", col_pos, 0.046, 0.16, steer_rot, mats["charcoal_trim"], vertices=28, bevel=0.004, parent=steering_group)
    stalk_l_pos = steer_world(Vector((-0.09, 0.03, -0.055)))
    make_cylinder("STEER_STALK_L", stalk_l_pos, 0.006, 0.08, Euler((math.radians(65), math.radians(-75), 0)), mats["charcoal_trim"], vertices=16, parent=steering_group)
    stalk_r_pos = steer_world(Vector((0.09, 0.03, -0.055)))
    make_cylinder("STEER_STALK_R", stalk_r_pos, 0.006, 0.08, Euler((math.radians(65), math.radians(75), 0)), mats["charcoal_trim"], vertices=16, parent=steering_group)

    # Column-Mounted Paddle Shifters (Left downshift, Right upshift)
    pad_l_pos = steer_world(Vector((-0.138, 0.020, -0.022)))
    make_box("STEERING_PADDLE_SHIFTERS", pad_l_pos, (0.022, 0.092, 0.004), mats["aluminum_brushed"], rot_euler=steer_rot, bevel=0.002, parent=steering_group)
    pad_r_pos = steer_world(Vector((0.138, 0.020, -0.022)))
    make_box("STEER_PADDLE_R", pad_r_pos, (0.022, 0.092, 0.004), mats["aluminum_brushed"], rot_euler=steer_rot, bevel=0.002, parent=steering_group)

    rim_r = 0.175
    tube_r = 0.015
    stripe_pos = steer_world(Vector((0.0, rim_r, 0.0)))
    make_cylinder("STEERING_TOP_STRIPE", stripe_pos, tube_r * 1.08, 0.016, Euler((0, math.radians(90), 0)), mats["gauge_needle_red"], vertices=24, parent=steering_group)

    # Drive Mode Dial on lower right spoke
    dial_pos = steer_world(Vector((0.065, -0.065, 0.014)))
    make_cylinder("STEER_MODE_BASE", dial_pos, 0.013, 0.006, steer_rot, mats["piano_black"], vertices=24, parent=steering_group)
    make_knurled_cylinder("STEERING_DRIVE_MODE_DIAL", dial_pos + R_steer @ Vector((0, 0, 0.005)), 0.011, 0.010, steer_rot, mats["gauge_needle_red"], ridges=20, parent=steering_group)

    # 6.1 Wheel 1: Sport 3-Spoke Contoured Wheel (Visible by default)
    wheel_sport = make_sculpted_steering_rim("STEERING_SPORT_3SPOKE", steer_pos, steer_rot, rim_r, tube_r, is_flat_bottom=False, mat=mats["leather_ebony"], parent=steering_group)
    boss_r = 0.048
    boss_pos = steer_world(Vector((0.0, 0.0, 0.006)))
    make_cylinder("STEER_SPORT_BOSS", boss_pos, boss_r, 0.020, steer_rot, mats["leather_ebony"], vertices=32, bevel=0.004, parent=wheel_sport)
    crest_ring_pos = steer_world(Vector((0.0, 0.0, 0.018)))
    make_cylinder("STEER_SPORT_CREST_RING", crest_ring_pos, 0.020, 0.003, steer_rot, mats["chrome_mirror"], vertices=36, parent=wheel_sport)
    crest_obj = make_box("STEER_SPORT_CREST_SHIELD", crest_ring_pos + R_steer @ Vector((0, 0, 0.002)), (0.025, 0.025, 0.002), mats["steering_badge"], rot_euler=steer_rot, bevel=0, parent=wheel_sport)
    unwrap_tilted_dial_uv(crest_obj, 0.0125, (math.radians(78), 0, 0))

    spoke_len = rim_r - boss_r + 0.008
    spoke_l_cx = -(boss_r + spoke_len / 2.0 - 0.004)
    make_box("STEER_SPORT_SPOKE_L", steer_world(Vector((spoke_l_cx, 0.0, 0.003))), (spoke_len, 0.026, 0.008), mats["aluminum_brushed"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)
    spoke_r_cx = (boss_r + spoke_len / 2.0 - 0.004)
    make_box("STEER_SPORT_SPOKE_R", steer_world(Vector((spoke_r_cx, 0.0, 0.003))), (spoke_len, 0.026, 0.008), mats["aluminum_brushed"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)
    spoke_b_cy = -(boss_r + spoke_len / 2.0 - 0.004)
    make_box("STEER_SPORT_SPOKE_B", steer_world(Vector((0.0, spoke_b_cy, 0.003))), (0.026, spoke_len, 0.008), mats["aluminum_brushed"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)

    # Button Pods
    btn_l_pos = steer_world(Vector((spoke_l_cx, 0.0, 0.008)))
    make_box("STEER_BTNS_L", btn_l_pos, (0.044, 0.026, 0.006), mats["piano_black"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)
    btn_r_pos = steer_world(Vector((spoke_r_cx, 0.0, 0.008)))
    make_box("STEER_BTNS_R", btn_r_pos, (0.044, 0.026, 0.006), mats["piano_black"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)

    # 6.2 Wheel 2: GT 3-Spoke Flat-Bottom Wheel
    wheel_gt = bpy.data.objects.new("STEERING_GT_3SPOKE", None)
    bpy.context.scene.collection.objects.link(wheel_gt)
    attach_to_parent(wheel_gt, steering_group)
    make_sculpted_steering_rim("STEER_GT_RIM_SCULPT", steer_pos, steer_rot, rim_r, tube_r, is_flat_bottom=True, mat=mats["leather_perforated"], parent=wheel_gt)
    make_cylinder("STEER_GT_BOSS", boss_pos, boss_r, 0.020, steer_rot, mats["leather_ebony"], vertices=32, bevel=0.003, parent=wheel_gt)
    make_box("STEER_GT_SPOKE_L", steer_world(Vector((spoke_l_cx, 0.0, 0.003))), (spoke_len, 0.028, 0.008), mats["titanium_matte"], rot_euler=steer_rot, bevel=0.002, parent=wheel_gt)
    make_box("STEER_GT_SPOKE_R", steer_world(Vector((spoke_r_cx, 0.0, 0.003))), (spoke_len, 0.028, 0.008), mats["titanium_matte"], rot_euler=steer_rot, bevel=0.002, parent=wheel_gt)
    make_box("STEER_GT_SPOKE_B", steer_world(Vector((0.0, spoke_b_cy, 0.003))), (0.028, spoke_len, 0.008), mats["titanium_matte"], rot_euler=steer_rot, bevel=0.002, parent=wheel_gt)
    wheel_gt.hide_viewport = True
    wheel_gt.hide_render = True

    # 6.3 Wheel 3: GT3 Track Yoke
    wheel_yoke = make_box("STEERING_GT3_YOKE", steer_pos, (0.28, 0.16, 0.024), mats["carbon_twill"], rot_euler=steer_rot, bevel=0.008, parent=steering_group)
    make_cylinder("STEERING_YOKE_GRIP_L", steer_world(Vector((-0.13, 0.0, 0.0))), 0.022, 0.15, steer_rot, mats["charcoal_trim"], vertices=24, parent=wheel_yoke)
    make_cylinder("STEERING_YOKE_GRIP_R", steer_world(Vector((0.13, 0.0, 0.0))), 0.022, 0.15, steer_rot, mats["charcoal_trim"], vertices=24, parent=wheel_yoke)
    wheel_yoke.hide_viewport = True
    wheel_yoke.hide_render = True

    # 6.4 Wheel 4: Formula Carbon Yoke
    wheel_formula = make_box("STEERING_FORMULA", steer_pos, (0.26, 0.13, 0.020), mats["carbon_twill"], rot_euler=steer_rot, bevel=0.006, parent=steering_group)
    make_box("STEER_FORMULA_LED_STRIP", steer_world(Vector((0.0, 0.055, 0.010))), (0.16, 0.008, 0.004), mats["gauge_needle_red"], rot_euler=steer_rot, bevel=0, parent=wheel_formula)
    wheel_formula.hide_viewport = True
    wheel_formula.hide_render = True

    # 6.5 Wheel 5: Luxury 2-Spoke Floating Wheel
    wheel_lux = bpy.data.objects.new("STEERING_LUXURY_2SPOKE", None)
    bpy.context.scene.collection.objects.link(wheel_lux)
    attach_to_parent(wheel_lux, steering_group)
    make_sculpted_steering_rim("STEER_LUX_RIM", steer_pos, steer_rot, rim_r * 1.02, tube_r * 1.05, is_flat_bottom=False, mat=mats["leather_ebony"], parent=wheel_lux)
    make_box("STEER_LUX_SPOKE_BAR", steer_world(Vector((0.0, -0.02, 0.003))), (rim_r * 1.9, 0.045, 0.010), mats["wood_walnut"], rot_euler=steer_rot, bevel=0.004, parent=wheel_lux)
    make_cylinder("STEER_LUX_BOSS", boss_pos, boss_r * 1.1, 0.020, steer_rot, mats["leather_ebony"], vertices=32, bevel=0.004, parent=wheel_lux)
    wheel_lux.hide_viewport = True
    wheel_lux.hide_render = True

    # 6.6 Wheel 6: Classic 4-Spoke Stainless Steel Wheel
    wheel_classic = bpy.data.objects.new("STEERING_CLASSIC_4SPOKE", None)
    bpy.context.scene.collection.objects.link(wheel_classic)
    attach_to_parent(wheel_classic, steering_group)
    make_sculpted_steering_rim("STEER_CLASSIC_RIM", steer_pos, steer_rot, rim_r * 1.05, 0.012, is_flat_bottom=False, mat=mats["wood_walnut"], parent=wheel_classic)
    make_cylinder("STEER_CLASSIC_HORN", boss_pos, boss_r * 0.85, 0.022, steer_rot, mats["chrome_mirror"], vertices=32, bevel=0.004, parent=wheel_classic)
    for sp_ang in [45, 135, 225, 315]:
        sp_rad = math.radians(sp_ang)
        sp_x = math.cos(sp_rad) * (rim_r * 0.5)
        sp_y = math.sin(sp_rad) * (rim_r * 0.5)
        make_box(f"STEER_CLASSIC_SPOKE_{sp_ang}", steer_world(Vector((sp_x, sp_y, 0.002))), (0.014, rim_r * 0.9, 0.004), mats["chrome_mirror"], rot_euler=Euler((math.radians(78), 0, sp_rad)), bevel=0.001, parent=wheel_classic)
    wheel_classic.hide_viewport = True
    wheel_classic.hide_render = True

    # 6.7 Wheel 7: Performance 4-Spoke Split Wheel
    wheel_perf = bpy.data.objects.new("STEERING_PERFORMANCE_4SPOKE", None)
    bpy.context.scene.collection.objects.link(wheel_perf)
    attach_to_parent(wheel_perf, steering_group)
    make_sculpted_steering_rim("STEER_PERF_RIM", steer_pos, steer_rot, rim_r, tube_r, is_flat_bottom=False, mat=mats["headliner_alcantara"], parent=wheel_perf)
    make_box("STEER_PERF_CORE", boss_pos, (boss_r * 1.6, boss_r * 1.6, 0.022), mats["carbon_twill"], rot_euler=steer_rot, bevel=0.004, parent=wheel_perf)
    wheel_perf.hide_viewport = True
    wheel_perf.hide_render = True

    # ------------------------------------------------------------------------
    # 7. CENTER CONSOLE & SHIFTER BRANCH (7 Modular Shifters)
    # ------------------------------------------------------------------------
    log("7. Modeling CENTER_CONSOLE & SHIFTER branch with 7 discrete selectors...")
    console_root = bpy.data.objects.new("CENTER_CONSOLE", None)
    bpy.context.scene.collection.objects.link(console_root)
    attach_to_parent(console_root, cockpit_master)

    # Sculpted Tapering Bridge Console (Tapering from 0.32m at dash down to 0.26m)
    make_box("CONSOLE_BASE", (0.0, -0.32, 0.38), (0.28, 0.65, 0.22), mats["dash_main_cognac"], bevel=0.018, parent=console_root)
    make_box("CONSOLE_BOLSTER_L", (-0.145, -0.32, 0.44), (0.028, 0.62, 0.12), mats["leather_ebony"], bevel=0.014, parent=console_root)
    make_box("CONSOLE_BOLSTER_R", (0.145, -0.32, 0.44), (0.028, 0.62, 0.12), mats["leather_ebony"], bevel=0.014, parent=console_root)
    make_box("CONSOLE_BOLSTER_STITCH_L", (-0.155, -0.32, 0.48), (0.003, 0.60, 0.003), mats["stitch_gold"], bevel=0, parent=console_root)
    make_box("CONSOLE_BOLSTER_STITCH_R", (0.155, -0.32, 0.48), (0.003, 0.60, 0.003), mats["stitch_gold"], bevel=0, parent=console_root)

    con_top_obj = make_box("CONSOLE_TOP_PLATE", (0.0, -0.32, 0.492), (0.24, 0.62, 0.018), mats["wood_walnut"], bevel=0.004, parent=console_root)
    unwrap_console_top_uv(con_top_obj)
    make_box("CONSOLE_CHROME_BORDER", (0.0, -0.32, 0.490), (0.248, 0.628, 0.016), mats["chrome_mirror"], bevel=0.002, parent=console_root)

    # Cupholders with Ambient Light Ring
    make_cylinder("CONSOLE_CUPHOLDER_L", (-0.050, -0.42, 0.486), 0.038, 0.032, (0, 0, 0), mats["piano_black"], vertices=32, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_R", (0.050, -0.42, 0.486), 0.038, 0.032, (0, 0, 0), mats["piano_black"], vertices=32, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_CHROME", (0.0, -0.42, 0.501), 0.088, 0.003, (0, 0, 0), mats["chrome_mirror"], vertices=36, bevel=0.001, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_LIGHT_RING", (0.0, -0.42, 0.502), 0.086, 0.002, (0, 0, 0), mats["ambient_cyan"], vertices=36, parent=console_root)

    # Armrest Storage Compartment
    make_box("CONSOLE_ARMREST", (0.0, -0.56, 0.51), (0.24, 0.28, 0.055), mats["leather_ebony"], bevel=0.016, parent=console_root)
    make_box("CONSOLE_ARMREST_SPLIT_SEAM", (0.0, -0.56, 0.538), (0.003, 0.28, 0.003), mats["charcoal_trim"], bevel=0, parent=console_root)

    # Controls: Electronic Parking Brake & Rotary Dial
    make_box("CONSOLE_EPB_SWITCH", (-0.065, -0.22, 0.504), (0.024, 0.040, 0.012), mats["aluminum_brushed"], bevel=0.002, parent=console_root)
    make_knurled_cylinder("CONSOLE_DRIVE_MODE", (0.065, -0.22, 0.504), 0.022, 0.014, (0, 0, 0), mats["chrome_mirror"], ridges=28, parent=console_root)

    # ------------------------------------------------------------------------
    # SHIFTER ROOT (Children of CENTER_CONSOLE)
    # ------------------------------------------------------------------------
    shifter_root = bpy.data.objects.new("SHIFTER", None)
    bpy.context.scene.collection.objects.link(shifter_root)
    attach_to_parent(shifter_root, console_root)

    shifter_pos = Vector((0.0, -0.14, 0.50))

    # Shifter 1: Automatic Lever (Default)
    shifter_auto = bpy.data.objects.new("CONSOLE_SHIFTER_AUTO", None)
    bpy.context.scene.collection.objects.link(shifter_auto)
    attach_to_parent(shifter_auto, shifter_root)
    make_box("SHIFTER_AUTO_BEZEL", shifter_pos, (0.09, 0.12, 0.010), mats["piano_black"], bevel=0.002, parent=shifter_auto)
    prnd_plane = make_box("SHIFTER_AUTO_PRND_DISPLAY", shifter_pos + Vector((-0.025, 0.0, 0.006)), (0.022, 0.09, 0.002), mats["shifter_prnd"], bevel=0, parent=shifter_auto)
    unwrap_planar_uv(prnd_plane)
    make_cylinder("SHIFTER_AUTO_SHAFT", shifter_pos + Vector((0.015, 0.0, 0.035)), 0.008, 0.065, (0, 0, 0), mats["chrome_mirror"], vertices=24, parent=shifter_auto)
    make_box("SHIFTER_AUTO_KNOB", shifter_pos + Vector((0.015, -0.005, 0.075)), (0.045, 0.075, 0.035), mats["leather_ebony"], bevel=0.008, parent=shifter_auto)
    make_box("SHIFTER_AUTO_TRIGGER", shifter_pos + Vector((0.015, 0.032, 0.065)), (0.022, 0.008, 0.020), mats["chrome_mirror"], bevel=0.001, parent=shifter_auto)

    # Shifter 2: Classic Gated Manual
    shifter_gated = bpy.data.objects.new("CONSOLE_SHIFTER_MANUAL_GATED", None)
    bpy.context.scene.collection.objects.link(shifter_gated)
    attach_to_parent(shifter_gated, shifter_root)
    make_box("SHIFTER_GATED_PLATE", shifter_pos, (0.09, 0.12, 0.012), mats["aluminum_brushed"], bevel=0.003, parent=shifter_gated)
    for g_i in [-0.025, 0.0, 0.025]:
        make_box(f"SHIFTER_GATED_SLOT_{g_i}", shifter_pos + Vector((g_i, 0.0, 0.007)), (0.007, 0.08, 0.003), mats["piano_black"], bevel=0, parent=shifter_gated)
    make_box("SHIFTER_GATED_CROSS", shifter_pos + Vector((0.0, 0.0, 0.007)), (0.06, 0.007, 0.003), mats["piano_black"], bevel=0, parent=shifter_gated)
    make_cylinder("SHIFTER_GATED_LEVER", shifter_pos + Vector((0.0, 0.01, 0.06)), 0.006, 0.11, (math.radians(-8), 0, 0), mats["chrome_mirror"], vertices=24, parent=shifter_gated)
    make_cylinder("SHIFTER_GATED_BALL", shifter_pos + Vector((0.0, 0.025, 0.115)), 0.020, 0.038, (math.radians(-8), 0, 0), mats["aluminum_brushed"], vertices=32, bevel=0.008, parent=shifter_gated)
    shifter_gated.hide_viewport = True
    shifter_gated.hide_render = True

    # Shifter 3: H-Pattern Manual with Leather Boot
    shifter_h = bpy.data.objects.new("CONSOLE_SHIFTER_MANUAL_H", None)
    bpy.context.scene.collection.objects.link(shifter_h)
    attach_to_parent(shifter_h, shifter_root)
    make_cylinder("SHIFTER_H_CHROME_RING", shifter_pos, 0.052, 0.012, (0, 0, 0), mats["chrome_mirror"], vertices=32, bevel=0.002, parent=shifter_h)
    make_cylinder("SHIFTER_H_LEATHER_BOOT", shifter_pos + Vector((0.0, 0.0, 0.025)), 0.046, 0.045, (0, 0, 0), mats["leather_ebony"], vertices=24, bevel=0.010, parent=shifter_h)
    make_cylinder("SHIFTER_H_ROD", shifter_pos + Vector((0.0, 0.0, 0.07)), 0.007, 0.08, (0, 0, 0), mats["titanium_matte"], vertices=20, parent=shifter_h)
    make_cylinder("SHIFTER_H_KNOB", shifter_pos + Vector((0.0, 0.0, 0.105)), 0.022, 0.036, (0, 0, 0), mats["leather_ebony"], vertices=32, bevel=0.006, parent=shifter_h)
    make_cylinder("SHIFTER_H_CAP", shifter_pos + Vector((0.0, 0.0, 0.124)), 0.015, 0.003, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=shifter_h)
    shifter_h.hide_viewport = True
    shifter_h.hide_render = True

    # Shifter 4: Electronic Toggle Rocker
    shifter_toggle = bpy.data.objects.new("CONSOLE_SHIFTER_TOGGLE", None)
    bpy.context.scene.collection.objects.link(shifter_toggle)
    attach_to_parent(shifter_toggle, shifter_root)
    make_box("SHIFTER_TOGGLE_HOUSING", shifter_pos, (0.075, 0.10, 0.015), mats["piano_black"], bevel=0.003, parent=shifter_toggle)
    make_box("SHIFTER_TOGGLE_ROCKER", shifter_pos + Vector((0.0, 0.0, 0.015)), (0.035, 0.065, 0.022), mats["aluminum_brushed"], rot_euler=Euler((math.radians(12), 0, 0)), bevel=0.004, parent=shifter_toggle)
    make_box("SHIFTER_TOGGLE_P_BTN", shifter_pos + Vector((0.0, -0.035, 0.012)), (0.024, 0.018, 0.008), mats["piano_black"], bevel=0.001, parent=shifter_toggle)
    shifter_toggle.hide_viewport = True
    shifter_toggle.hide_render = True

    # Shifter 5: Rotary Dial
    shifter_rotary = bpy.data.objects.new("CONSOLE_SHIFTER_ROTARY", None)
    bpy.context.scene.collection.objects.link(shifter_rotary)
    attach_to_parent(shifter_rotary, shifter_root)
    make_cylinder("SHIFTER_ROTARY_RING", shifter_pos, 0.046, 0.012, (0, 0, 0), mats["piano_black"], vertices=32, bevel=0.002, parent=shifter_rotary)
    make_knurled_cylinder("SHIFTER_ROTARY_DIAL", shifter_pos + Vector((0.0, 0.0, 0.016)), 0.038, 0.026, (0, 0, 0), mats["aluminum_brushed"], ridges=36, parent=shifter_rotary)
    make_cylinder("SHIFTER_ROTARY_TOP_CAP", shifter_pos + Vector((0.0, 0.0, 0.030)), 0.028, 0.003, (0, 0, 0), mats["piano_black"], vertices=28, parent=shifter_rotary)
    shifter_rotary.hide_viewport = True
    shifter_rotary.hide_render = True

    # Shifter 6: Crystal Faceted Selector
    shifter_crystal = bpy.data.objects.new("CONSOLE_SHIFTER_CRYSTAL", None)
    bpy.context.scene.collection.objects.link(shifter_crystal)
    attach_to_parent(shifter_crystal, shifter_root)
    make_box("SHIFTER_CRYSTAL_BEZEL", shifter_pos, (0.08, 0.10, 0.012), mats["piano_black"], bevel=0.002, parent=shifter_crystal)
    make_box("SHIFTER_CRYSTAL_FACETED", shifter_pos + Vector((0.0, 0.0, 0.035)), (0.040, 0.065, 0.055), mats["crystal_faceted"], rot_euler=Euler((math.radians(8), 0, 0)), bevel=0.008, parent=shifter_crystal)
    make_cylinder("SHIFTER_CRYSTAL_CORE_GLOW", shifter_pos + Vector((0.0, 0.0, 0.032)), 0.012, 0.035, (0, 0, 0), mats["ambient_cyan"], vertices=16, parent=shifter_crystal)
    shifter_crystal.hide_viewport = True
    shifter_crystal.hide_render = True

    # Shifter 7: Performance Sequential Lever
    shifter_perf = bpy.data.objects.new("CONSOLE_SHIFTER_PERFORMANCE", None)
    bpy.context.scene.collection.objects.link(shifter_perf)
    attach_to_parent(shifter_perf, shifter_root)
    make_box("SHIFTER_PERF_BASE", shifter_pos, (0.08, 0.11, 0.016), mats["carbon_twill"], bevel=0.003, parent=shifter_perf)
    make_cylinder("SHIFTER_PERF_LEVER", shifter_pos + Vector((0.0, 0.0, 0.09)), 0.009, 0.16, (math.radians(-6), 0, 0), mats["titanium_matte"], vertices=24, parent=shifter_perf)
    make_knurled_cylinder("SHIFTER_PERF_HANDLE", shifter_pos + Vector((0.0, 0.015, 0.17)), 0.016, 0.075, (math.radians(-6), 0, 0), mats["aluminum_brushed"], ridges=28, parent=shifter_perf)
    shifter_perf.hide_viewport = True
    shifter_perf.hide_render = True

    # ------------------------------------------------------------------------
    # 8. DOORS BRANCH (Framing Driver & Passenger Sides)
    # ------------------------------------------------------------------------
    log("8. Modeling DOORS branch with sculpted armrests & speakers...")
    doors_group = bpy.data.objects.new("DOORS", None)
    bpy.context.scene.collection.objects.link(doors_group)
    attach_to_parent(doors_group, cockpit_master)

    # Left Door Card (Driver Side)
    make_box("DOOR_CARD_L", (-dash_w * 0.51, -0.35, 0.48), (0.058, 0.76, 0.40), mats["dash_main_cognac"], bevel=0.016, parent=doors_group)
    make_box("DOOR_ARMREST_L", (-dash_w * 0.49, -0.32, 0.50), (0.068, 0.38, 0.085), mats["leather_ebony"], bevel=0.010, parent=doors_group)
    make_box("DOOR_HANDLE_CHROME_L", (-dash_w * 0.48, -0.18, 0.56), (0.025, 0.12, 0.035), mats["chrome_mirror"], bevel=0.003, parent=doors_group)
    door_spk_l = make_cylinder("DOOR_SPEAKER_L", (-dash_w * 0.485, -0.42, 0.40), 0.055, 0.008, (0, math.radians(90), 0), mats["speaker_acoustic"], vertices=28, parent=doors_group)
    unwrap_planar_uv(door_spk_l)
    make_box("DOOR_TRIM_SPEAR_L", (-dash_w * 0.485, -0.32, 0.58), (0.008, 0.65, 0.032), mats["wood_walnut"], bevel=0.002, parent=doors_group)
    make_box("DOOR_AMBIENT_L", (-dash_w * 0.482, -0.32, 0.565), (0.004, 0.64, 0.004), mats["ambient_cyan"], bevel=0, parent=doors_group)

    # Right Door Card (Passenger Side)
    make_box("DOOR_CARD_R", (dash_w * 0.51, -0.35, 0.48), (0.058, 0.76, 0.40), mats["dash_main_cognac"], bevel=0.016, parent=doors_group)
    make_box("DOOR_ARMREST_R", (dash_w * 0.49, -0.32, 0.50), (0.068, 0.38, 0.085), mats["leather_ebony"], bevel=0.010, parent=doors_group)
    make_box("DOOR_HANDLE_CHROME_R", (dash_w * 0.48, -0.18, 0.56), (0.025, 0.12, 0.035), mats["chrome_mirror"], bevel=0.003, parent=doors_group)
    door_spk_r = make_cylinder("DOOR_SPEAKER_R", (dash_w * 0.485, -0.42, 0.40), 0.055, 0.008, (0, math.radians(90), 0), mats["speaker_acoustic"], vertices=28, parent=doors_group)
    unwrap_planar_uv(door_spk_r)
    make_box("DOOR_TRIM_SPEAR_R", (dash_w * 0.485, -0.32, 0.58), (0.008, 0.65, 0.032), mats["wood_walnut"], bevel=0.002, parent=doors_group)
    make_box("DOOR_AMBIENT_R", (dash_w * 0.482, -0.32, 0.565), (0.004, 0.64, 0.004), mats["ambient_cyan"], bevel=0, parent=doors_group)

    # ------------------------------------------------------------------------
    # 9. SEATS & BELTS BRANCH (Contoured Sport Bucket Seats)
    # ------------------------------------------------------------------------
    log("9. Modeling SEATS branch with deep bolsters & harness slots...")
    seats_group = bpy.data.objects.new("SEATS", None)
    bpy.context.scene.collection.objects.link(seats_group)
    attach_to_parent(seats_group, cockpit_master)

    for s_side, sx in [("DRIVER", driver_x), ("PASS", pass_x)]:
        # Contoured Bottom Cushion with Thigh Bolsters
        make_box(f"SEAT_CUSHION_{s_side}", (sx, -0.48, 0.20), (0.46, 0.46, 0.14), mats["leather_ebony"], bevel=0.022, parent=seats_group)
        make_box(f"SEAT_THIGH_L_{s_side}", (sx - 0.21, -0.48, 0.26), (0.075, 0.44, 0.11), mats["leather_ebony"], bevel=0.016, parent=seats_group)
        make_box(f"SEAT_THIGH_R_{s_side}", (sx + 0.21, -0.48, 0.26), (0.075, 0.44, 0.11), mats["leather_ebony"], bevel=0.016, parent=seats_group)

        # Sculpted Backrest with Deep Torso / Shoulder Bolsters
        make_box(f"SEAT_BACKREST_{s_side}", (sx, -0.85, 0.54), (0.44, 0.14, 0.54), mats["leather_ebony"], bevel=0.022, parent=seats_group)
        make_box(f"SEAT_SHOULDER_L_{s_side}", (sx - 0.20, -0.82, 0.58), (0.085, 0.16, 0.42), mats["leather_ebony"], bevel=0.018, parent=seats_group)
        make_box(f"SEAT_SHOULDER_R_{s_side}", (sx + 0.20, -0.82, 0.58), (0.085, 0.16, 0.42), mats["leather_ebony"], bevel=0.018, parent=seats_group)

        # Integrated Headrest with Chrome Support Posts
        make_box(f"SEAT_HEADREST_{s_side}", (sx, -0.86, 0.86), (0.24, 0.10, 0.15), mats["leather_ebony"], bevel=0.016, parent=seats_group)
        make_cylinder(f"SEAT_POST_L_{s_side}", (sx - 0.06, -0.86, 0.78), 0.007, 0.08, (0, 0, 0), mats["chrome_mirror"], vertices=16, parent=seats_group)
        make_cylinder(f"SEAT_POST_R_{s_side}", (sx + 0.06, -0.86, 0.78), 0.007, 0.08, (0, 0, 0), mats["chrome_mirror"], vertices=16, parent=seats_group)

        # Seatbelt Buckle
        buckle_x = sx + (0.16 if s_side == "DRIVER" else -0.16)
        make_box(f"SEATBELT_BUCKLE_{s_side}", (buckle_x, -0.38, 0.35), (0.032, 0.055, 0.075), mats["charcoal_trim"], bevel=0.003, parent=seats_group)
        make_box(f"SEATBELT_RED_BTN_{s_side}", (buckle_x, -0.38, 0.39), (0.024, 0.035, 0.008), mats["gauge_needle_red"], bevel=0.001, parent=seats_group)

        # 3-Point Seatbelt Webbing Strap
        strap_rot = Euler((math.radians(35), math.radians(-15 if s_side == "DRIVER" else 15), 0))
        make_box(f"SEATBELT_STRAP_{s_side}", (sx, -0.62, 0.55), (0.048, 0.003, 0.65), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=seats_group)

    # ------------------------------------------------------------------------
    # 10. LIGHTING BRANCH (Multi-Zone Ambient Lightguides)
    # ------------------------------------------------------------------------
    log("10. Modeling LIGHTING branch...")
    lighting_group = bpy.data.objects.new("LIGHTING", None)
    bpy.context.scene.collection.objects.link(lighting_group)
    attach_to_parent(lighting_group, cockpit_master)

    make_box("AMBIENT_LIGHT_DASH", (0.0, -0.055, 0.672), (dash_w * 0.95, 0.008, 0.005), mats["ambient_cyan"], bevel=0, parent=lighting_group)
    make_box("AMBIENT_LIGHT_CONSOLE", (0.0, -0.32, 0.485), (0.23, 0.60, 0.004), mats["ambient_cyan"], bevel=0, parent=lighting_group)
    make_box("AMBIENT_LIGHT_FOOTWELL_L", (driver_x, 0.10, 0.32), (0.35, 0.20, 0.004), mats["ambient_cyan"], bevel=0, parent=lighting_group)
    make_box("AMBIENT_LIGHT_FOOTWELL_R", (pass_x, 0.10, 0.32), (0.35, 0.20, 0.004), mats["ambient_cyan"], bevel=0, parent=lighting_group)

    # ------------------------------------------------------------------------
    # 11. CONTROLS / PEDALS BRANCH
    # ------------------------------------------------------------------------
    log("11. Modeling CONTROLS / PEDALS branch...")
    controls_group = bpy.data.objects.new("CONTROLS", None)
    bpy.context.scene.collection.objects.link(controls_group)
    attach_to_parent(controls_group, cockpit_master)

    pedal_base = Vector((driver_x, 0.28, 0.18))
    make_box("PEDAL_THROTTLE", pedal_base + Vector((0.10, 0.0, 0.08)), (0.038, 0.012, 0.12), mats["aluminum_brushed"], bevel=0.002, parent=controls_group)
    for th_i in range(3):
        make_box(f"PEDAL_TH_RUBBER_{th_i+1}", pedal_base + Vector((0.092 + th_i * 0.008, -0.007, 0.08)), (0.004, 0.003, 0.10), mats["rubber_traction"], bevel=0, parent=controls_group)

    make_box("PEDAL_BRAKE", pedal_base + Vector((0.0, 0.0, 0.10)), (0.068, 0.014, 0.075), mats["aluminum_brushed"], bevel=0.002, parent=controls_group)
    for r_i in range(3):
        make_box(f"PEDAL_BRAKE_RUBBER_{r_i+1}", pedal_base + Vector((0.0, -0.008, 0.08 + r_i * 0.022)), (0.052, 0.004, 0.008), mats["rubber_traction"], bevel=0, parent=controls_group)
    make_box("PEDAL_DEAD", pedal_base + Vector((-0.12, 0.0, 0.09)), (0.055, 0.012, 0.14), mats["rubber_traction"], bevel=0.002, parent=controls_group)

    # ------------------------------------------------------------------------
    # EXPORT MASTER GLB
    # ------------------------------------------------------------------------
    out_dir = os.path.abspath("public/models/interior")
    os.makedirs(out_dir, exist_ok=True)
    out_glb = os.path.join(out_dir, "dashboard_interactive_master.glb")
    log(f"Exporting complete Class-A interactive dashboard to: {out_glb}")

    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='AUTO',
    )
    sz_kb = os.path.getsize(out_glb) / 1024.0
    log(f"[SUCCESS] Exported dashboard_interactive_master.glb ({sz_kb:.1f} KB)")

if __name__ == "__main__":
    build_class_a_interactive_dashboard()
