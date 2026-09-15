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
    # Safe non-destructive clearing that preserves MCP socket listener
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)

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
    mats["safety_yellow"] = make_pbr_mat("Mat_Stanchion_Yellow", (0.95, 0.78, 0.05, 1.0), metallic=0.05, roughness=0.25, clearcoat=0.5)
    mats["led_emerald"] = make_pbr_mat("Mat_LED_Emerald_Green", (0.05, 0.95, 0.20, 1.0), emission=(0.05, 0.95, 0.20, 1.0), emission_strength=5.0)
    mats["led_amber"] = make_pbr_mat("Mat_LED_Indicator_Amber", (0.98, 0.55, 0.05, 1.0), emission=(0.98, 0.55, 0.05, 1.0), emission_strength=5.0)
    mats["frosted_chiller_glass"] = make_pbr_mat("Mat_Chiller_Glass_Frosted", (0.85, 0.90, 0.95, 0.5), roughness=0.35, clearcoat=0.8, transmission=0.82, ior=1.52, alpha=0.5)
    mats["transit_fabric"] = make_pbr_mat("Mat_Transit_Fabric_Moquette", (0.08, 0.16, 0.32, 1.0), roughness=0.82, sheen=0.4)
    mats["transit_plastic_blue"] = make_pbr_mat("Mat_Transit_VandalProof_Blue", (0.05, 0.18, 0.45, 1.0), roughness=0.35, clearcoat=0.3)
    mats["led_crimson"] = make_pbr_mat("Mat_LED_Stop_Crimson", (0.95, 0.05, 0.05, 1.0), emission=(0.95, 0.05, 0.05, 1.0), emission_strength=5.5)

    # Motorsport, Roll Cage & Heavy Commercial Materials
    mats["rollcage_satin"] = make_pbr_mat("Mat_RollCage_ChroMoly_Satin", (0.10, 0.11, 0.13, 1.0), metallic=0.90, roughness=0.30)
    mats["rollcage_padding"] = make_pbr_mat("Mat_RollCage_Foam_Padding", (0.015, 0.015, 0.018, 1.0), metallic=0.02, roughness=0.94)
    mats["anodized_red"] = make_pbr_mat("Mat_Anodized_Red_Jewel", (0.85, 0.04, 0.04, 1.0), metallic=0.92, roughness=0.18)
    mats["anodized_blue"] = make_pbr_mat("Mat_Anodized_Blue_Race", (0.04, 0.22, 0.88, 1.0), metallic=0.92, roughness=0.18)
    mats["air_brake_yellow"] = make_pbr_mat("Mat_AirBrake_Yellow_Diamond", (0.95, 0.82, 0.04, 1.0), roughness=0.32)
    mats["air_brake_red"] = make_pbr_mat("Mat_AirBrake_Red_Octagon", (0.90, 0.06, 0.06, 1.0), roughness=0.32)
    mats["racing_harness_red"] = make_pbr_mat("Mat_Harness_Webbing_Red", (0.85, 0.05, 0.05, 1.0), roughness=0.62, sheen=0.55)
    mats["shift_light_green"] = make_pbr_mat("Mat_ShiftLight_Green", (0.05, 0.95, 0.15, 1.0), emission=(0.05, 0.95, 0.15, 1.0), emission_strength=5.5)
    mats["shift_light_amber"] = make_pbr_mat("Mat_ShiftLight_Amber", (0.98, 0.60, 0.04, 1.0), emission=(0.98, 0.60, 0.04, 1.0), emission_strength=6.0)
    mats["shift_light_blue"] = make_pbr_mat("Mat_ShiftLight_Blue_Flash", (0.10, 0.45, 1.0, 1.0), emission=(0.10, 0.45, 1.0, 1.0), emission_strength=7.5)

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

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
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

def make_curved_upper_pad(name, dash_w, mat=None, parent=None):
    """
    Constructs an organic, continuous Class-A curved dashboard upper pad.
    Spans the entire cabin width with smooth convex crown, aerodynamic cowl sweep,
    compound tumblehome curving toward doors, and a bullnose overhang facing the occupants.
    """
    n_x = 48
    slices = []
    half_w = dash_w * 0.5
    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = u * half_w
        sweep_y = 0.035 * (1.0 - u**2)
        crown_z = 0.016 * (1.0 - u**2)
        door_tumble = -0.010 * (abs(u)**2.5)

        y_front = 0.38 + sweep_y
        z_front = 0.772 + crown_z + door_tumble
        y_crest = 0.16 + sweep_y * 0.6
        z_crest = 0.770 + crown_z + door_tumble
        y_rear = -0.058 - sweep_y * 0.5
        z_rear = 0.742 + crown_z + door_tumble
        thick = 0.052

        slice_pts = []
        for t_step in range(10):
            t = t_step / 9.0
            if t <= 0.5:
                st = t / 0.5
                yp = y_front * (1.0 - st) + y_crest * st
                zp = z_front * (1.0 - st) + z_crest * st + 0.008 * math.sin(math.pi * st)
            else:
                st = (t - 0.5) / 0.5
                yp = y_crest * (1.0 - st) + y_rear * st
                zp = z_crest * (1.0 - st) + z_rear * st - 0.010 * (st**1.5)
            slice_pts.append(Vector((x, yp, zp)))

        r_brow = 0.018
        for b_step in range(1, 5):
            ang = (math.pi * 0.5) * (b_step / 4.0)
            yb = y_rear - r_brow * math.sin(ang)
            zb = z_rear - r_brow * (1.0 - math.cos(ang))
            slice_pts.append(Vector((x, yb, zb)))

        for u_step in range(1, 6):
            ut = u_step / 5.0
            yu = (y_rear - r_brow) * (1.0 - ut) + (y_front - 0.02) * ut
            zu = (z_rear - thick) * (1.0 - ut) + (z_front - thick) * ut
            slice_pts.append(Vector((x, yu, zu)))

        slices.append(slice_pts)

    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_binnacle_cowl(name, driver_x, mat=None, parent=None):
    """
    Constructs a sculptural driver instrument binnacle cowl with compound double-curvature arch.
    Sweeps up seamlessly over the gauge cluster and tapers organically at the flanks.
    """
    binnacle_w = 0.46
    n_x = 32
    half_bw = binnacle_w * 0.5
    slices = []

    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = driver_x + u * half_bw
        arch_factor = max(0.0, math.cos(u * (math.pi * 0.5)))**1.35
        peak_z = 0.772 + 0.056 * arch_factor
        rear_y = -0.042 - 0.060 * arch_factor
        front_y = 0.19 + 0.025 * arch_factor
        front_z = 0.776 + 0.018 * arch_factor

        slice_pts = []
        for t_step in range(8):
            t = t_step / 7.0
            yp = front_y * (1.0 - t) + rear_y * t
            zp = front_z * (1.0 - t) + peak_z * t + 0.010 * math.sin(math.pi * t)
            slice_pts.append(Vector((x, yp, zp)))

        r_lip = 0.016
        for l_step in range(1, 5):
            ang = (math.pi * 0.5) * (l_step / 4.0)
            yl = rear_y - r_lip * math.sin(ang)
            zl = peak_z - r_lip * (1.0 - math.cos(ang))
            slice_pts.append(Vector((x, yl, zl)))

        thick = 0.038
        for u_step in range(1, 6):
            ut = u_step / 5.0
            yu = (rear_y - r_lip) * (1.0 - ut) + front_y * ut
            zu = (peak_z - thick) * (1.0 - ut) + (front_z - 0.02) * ut
            slice_pts.append(Vector((x, yu, zu)))

        slices.append(slice_pts)

    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_passenger_sweep(name, pass_x, mat=None, parent=None):
    """
    Constructs a sculpted concave passenger dashboard sweep with flowing curves.
    """
    sweep_w = 0.54
    n_x = 24
    half_sw = sweep_w * 0.5
    slices = []

    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = pass_x + u * half_sw
        dish_factor = 1.0 - 0.25 * math.sin(math.pi * (0.5 + 0.5 * u))
        front_y = 0.32
        front_z = 0.772
        crest_y = 0.14
        crest_z = 0.765 * dish_factor + 0.005
        rear_y = 0.005
        rear_z = 0.750 * dish_factor

        slice_pts = []
        for t_step in range(6):
            t = t_step / 5.0
            yp = front_y * (1.0 - t) + rear_y * t
            zp = front_z * (1.0 - t) + crest_z * t
            slice_pts.append(Vector((x, yp, zp)))

        r_lip = 0.014
        for l_step in range(1, 4):
            ang = (math.pi * 0.5) * (l_step / 3.0)
            yl = rear_y - r_lip * math.sin(ang)
            zl = rear_z - r_lip * (1.0 - math.cos(ang))
            slice_pts.append(Vector((x, yl, zl)))

        thick = 0.035
        for u_step in range(1, 5):
            ut = u_step / 4.0
            yu = (rear_y - r_lip) * (1.0 - ut) + front_y * ut
            zu = (rear_z - thick) * (1.0 - ut) + (front_z - 0.02) * ut
            slice_pts.append(Vector((x, yu, zu)))

        slices.append(slice_pts)

    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_trim_spear_mesh(name, dash_w, mat=None, parent=None):
    """
    Constructs a crowned, aerodynamic Class-A horizontal decorative trim spear.
    """
    spear_w = dash_w * 0.96
    n_x = 28
    half_w = spear_w * 0.5
    slices = []

    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = u * half_w
        arch_y = 0.018 * (1.0 - u**2)
        base_y = -0.045 - arch_y
        base_z = 0.705
        h = 0.065
        depth = 0.036

        slice_pts = [
            Vector((x, base_y + depth, base_z + h * 0.45)),
            Vector((x, base_y + depth * 0.5, base_z + h * 0.5)),
            Vector((x, base_y, base_z + h * 0.48)),
            Vector((x, base_y - 0.008, base_z + h * 0.25)),
            Vector((x, base_y - 0.010, base_z)),
            Vector((x, base_y - 0.008, base_z - h * 0.25)),
            Vector((x, base_y, base_z - h * 0.48)),
            Vector((x, base_y + depth * 0.5, base_z - h * 0.5)),
            Vector((x, base_y + depth, base_z - h * 0.45)),
            Vector((x, base_y + depth * 1.05, base_z - h * 0.2)),
            Vector((x, base_y + depth * 1.05, base_z + h * 0.2)),
            Vector((x, base_y + depth, base_z + h * 0.45)),
        ]
        slices.append(slice_pts)

    obj = make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)
    unwrap_horizontal_strip_uv(obj)
    return obj

def make_curved_hvac_center_housing(name, mat=None, parent=None):
    """
    Constructs an aerodynamic dual-louver HVAC housing with rounded stadium contours.
    """
    w = 0.34
    h = 0.060
    depth = 0.030
    n_slices = 16
    slices = []

    for i in range(n_slices):
        t = i / (n_slices - 1)
        y = -0.045 - depth * t
        scale = 0.95 + 0.05 * t
        sw = (w * 0.5) * scale
        sh = (h * 0.5) * scale
        r_corner = 0.018 * scale

        ring = []
        for c_idx in range(16):
            ang = (2.0 * math.pi * c_idx) / 16.0
            ca = math.cos(ang)
            sa = math.sin(ang)
            cx = (sw - r_corner) if ca >= 0 else -(sw - r_corner)
            cz = (sh - r_corner) if sa >= 0 else -(sh - r_corner)
            px = cx + r_corner * ca
            pz = 0.722 + (cz + r_corner * sa)
            ring.append(Vector((px, y, pz)))
        slices.append(ring)

    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_console_base(name, mat=None, parent=None):
    """
    Constructs a flowing waterfall center console base bridging dashboard to tunnel.
    """
    n_slices = 32
    slices = []

    for i in range(n_slices):
        t = i / (n_slices - 1)
        y = -0.06 * (1.0 - t) + (-0.65) * t
        s_curve = 3.0 * t**2 - 2.0 * t**3
        z_top = 0.50 * (1.0 - s_curve) + 0.38 * s_curve
        z_bot = 0.22
        cw = (0.31 * (1.0 - t) + 0.25 * t) * 0.5
        r_edge = 0.022

        ring = [
            Vector((-cw, y, z_top - r_edge)),
            Vector((-cw + r_edge * 0.3, y, z_top - r_edge * 0.3)),
            Vector((-cw + r_edge, y, z_top)),
            Vector((0.0, y, z_top + 0.004)),
            Vector((cw - r_edge, y, z_top)),
            Vector((cw - r_edge * 0.3, y, z_top - r_edge * 0.3)),
            Vector((cw, y, z_top - r_edge)),
            Vector((cw * 0.98, y, z_bot + 0.05)),
            Vector((cw * 0.95, y, z_bot)),
            Vector((0.0, y, z_bot)),
            Vector((-cw * 0.95, y, z_bot)),
            Vector((-cw * 0.98, y, z_bot + 0.05)),
        ]
        slices.append(ring)

    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_cluster_hood(name, driver_x, mat=None, parent=None):
    """
    Constructs a sculptural arched hooded visor canopy over the instrument cluster.
    Provides deep sun-shading over the dual dials and display with organic curvature.
    """
    n_x = 24
    hood_w = 0.38
    half_w = hood_w * 0.5
    slices = []
    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = driver_x + u * half_w
        arch = max(0.0, math.cos(u * (math.pi * 0.5)))**1.3
        z_peak = 0.748 + 0.046 * arch
        y_front = 0.06
        y_rear = -0.076 - 0.024 * arch
        ring = [
            Vector((x, y_front, 0.710)),
            Vector((x, y_front, z_peak - 0.018)),
            Vector((x, y_front * 0.5, z_peak)),
            Vector((x, y_rear + 0.015, z_peak)),
            Vector((x, y_rear, z_peak - 0.012)),
            Vector((x, y_rear + 0.018, z_peak - 0.026)),
            Vector((x, y_rear + 0.028, 0.710)),
            Vector((x, y_front * 0.5, 0.708)),
        ]
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_sculpted_dash_main_body(name, dash_w, mat=None, parent=None):
    """
    Constructs an organic, continuous Class-A curved main lower dashboard body.
    Features subtle tumblehome slope, driver/passenger knee wells, and center console integration.
    """
    dash_w_eff = dash_w * 0.98
    half_w = dash_w_eff * 0.5
    n_slices = 32
    slices = []
    for i in range(n_slices):
        u = -1.0 + 2.0 * (i / (n_slices - 1))
        x = u * half_w
        arch_y = 0.025 * (1.0 - u**2)
        y_top = -0.040 - arch_y
        z_top = 0.672
        y_mid = -0.025 - arch_y * 0.8
        z_mid = 0.580
        y_bot = 0.180
        z_bot = 0.460

        tunnel_recess = max(0.0, 1.0 - (abs(u) / 0.22)**2) if abs(u) < 0.22 else 0.0
        z_tunnel = z_bot + 0.08 * tunnel_recess

        ring = [
            Vector((x, y_top + 0.25, z_top)),
            Vector((x, y_top + 0.12, z_top + 0.005)),
            Vector((x, y_top, z_top)),
            Vector((x, y_mid, z_mid)),
            Vector((x, y_mid + 0.08, (z_mid + z_tunnel) * 0.5)),
            Vector((x, y_bot, z_tunnel)),
            Vector((x, y_bot + 0.12, z_tunnel)),
            Vector((x, y_top + 0.25, z_tunnel + 0.05)),
        ]
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_glovebox(name, pass_x, mat=None, parent=None):
    """
    Constructs a 3D crowned passenger glovebox door with soft perimeter roundings.
    """
    w = 0.50
    h = 0.18
    half_w = w * 0.5
    half_h = h * 0.5
    n_x = 16
    slices = []
    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = pass_x + u * half_w
        crown_y = -0.008 * (1.0 - u**2)
        ring = []
        for j in range(8):
            v = -1.0 + 2.0 * (j / 7.0)
            z = 0.55 + v * half_h
            crown_z = -0.005 * (1.0 - v**2)
            y = -0.048 + crown_y + crown_z
            ring.append(Vector((x, y, z)))
        for j in range(7, -1, -1):
            v = -1.0 + 2.0 * (j / 7.0)
            z = 0.55 + v * half_h
            y = -0.048 + 0.025
            ring.append(Vector((x, y, z)))
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_driver_knee_bolster(name, driver_x, mat=None, parent=None):
    """
    Constructs a padded ergonomic driver knee bolster with soft impact contours.
    """
    w = 0.44
    h = 0.16
    half_w = w * 0.5
    half_h = h * 0.5
    n_x = 16
    slices = []
    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = driver_x + u * half_w
        crown_y = -0.006 * (1.0 - u**2)
        ring = []
        for j in range(8):
            v = -1.0 + 2.0 * (j / 7.0)
            z = 0.53 + v * half_h
            y = -0.046 + crown_y
            ring.append(Vector((x, y, z)))
        for j in range(7, -1, -1):
            v = -1.0 + 2.0 * (j / 7.0)
            z = 0.53 + v * half_h
            y = -0.046 + 0.022
            ring.append(Vector((x, y, z)))
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_console_top_plate(name, mat=None, parent=None):
    """
    Constructs a crowned S-curve waterfall top plate matching the console base contour.
    """
    n_s = 32
    slices = []
    for i in range(n_s):
        t = i / (n_s - 1)
        y = -0.06 * (1.0 - t) + (-0.65) * t
        s_curve = 3.0 * t**2 - 2.0 * t**3
        z = (0.50 * (1.0 - s_curve) + 0.38 * s_curve) + 0.005
        cw = (0.24 * (1.0 - t) + 0.19 * t) * 0.5
        th = 0.010
        ring = [
            Vector((-cw, y, z - th)),
            Vector((-cw, y, z)),
            Vector((-cw * 0.5, y, z + 0.002)),
            Vector((0.0, y, z + 0.003)),
            Vector((cw * 0.5, y, z + 0.002)),
            Vector((cw, y, z)),
            Vector((cw, y, z - th)),
            Vector((0.0, y, z - th)),
        ]
        slices.append(ring)
    obj = make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)
    unwrap_console_top_uv(obj)
    return obj

def make_curved_console_bolsters(parent, mat_leather, mat_stitch):
    """
    Constructs curved leather-padded knee bolsters with flowing gold French stitching
    flanking the waterfall console along its continuous S-curve profile.
    """
    for side_name, side_sign in [("L", -1.0), ("R", 1.0)]:
        n_s = 32
        slices = []
        stitch_pts = []
        for i in range(n_s):
            t = i / (n_s - 1)
            y = -0.06 * (1.0 - t) + (-0.65) * t
            s_curve = 3.0 * t**2 - 2.0 * t**3
            z_base = 0.50 * (1.0 - s_curve) + 0.38 * s_curve
            cw = (0.31 * (1.0 - t) + 0.25 * t) * 0.5
            x_c = side_sign * (cw + 0.006)
            rx = 0.016
            rz = 0.045
            ring = []
            for a_step in range(8):
                ang = (2.0 * math.pi * a_step) / 8.0
                px = x_c + rx * math.cos(ang)
                pz = z_base - 0.01 + rz * math.sin(ang)
                ring.append(Vector((px, y, pz)))
            slices.append(ring)
            stitch_pts.append(Vector((x_c, y, z_base + rz * 0.85)))

        make_sculpted_curved_mesh(f"CONSOLE_BOLSTER_{side_name}", slices, mat=mat_leather, parent=parent)

        # Stitch ribbon following the curve
        stitch_slices = []
        for i in range(len(stitch_pts)):
            pt = stitch_pts[i]
            sw = 0.002
            st_ring = [
                pt + Vector((-sw, 0, 0)),
                pt + Vector((-sw, 0, 0.002)),
                pt + Vector((sw, 0, 0.002)),
                pt + Vector((sw, 0, 0)),
            ]
            stitch_slices.append(st_ring)
        make_sculpted_curved_mesh(f"CONSOLE_BOLSTER_STITCH_{side_name}", stitch_slices, mat=mat_stitch, parent=parent)

def make_curved_armrest(name, mat=None, parent=None):
    """
    Constructs a double-crowned sculpted leather armrest cushion with ergonomic depression.
    """
    n_x = 16
    slices = []
    w = 0.24
    half_w = w * 0.5
    for i in range(n_x):
        u = -1.0 + 2.0 * (i / (n_x - 1))
        x = u * half_w
        depression = 0.004 * math.sin(math.pi * (0.5 + 0.5 * u))
        ring = [
            Vector((x, -0.42, 0.47)),
            Vector((x, -0.42, 0.505 - depression)),
            Vector((x, -0.56, 0.512 - depression)),
            Vector((x, -0.70, 0.502 - depression)),
            Vector((x, -0.70, 0.47)),
            Vector((x, -0.56, 0.47)),
        ]
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_a_pillar(name, side_sign, dash_w, mat=None, parent=None):
    """
    Constructs a lofted aerodynamic A-pillar sweeping continuously from the dash cowl
    up along the raked windshield to the roof header with smooth inward camber.
    """
    slices = []
    n_steps = 18
    for i in range(n_steps):
        t = i / (n_steps - 1)
        x = side_sign * (dash_w * 0.47 * (1.0 - t) + dash_w * 0.38 * t)
        y = 0.16 * (1.0 - t) + (-0.22) * t
        z = 0.76 * (1.0 - t) + 1.22 * t
        rx = 0.024 * (1.0 - 0.2 * t)
        ry = 0.038 * (1.0 - 0.15 * t)
        ring = []
        for k in range(8):
            ang = (2.0 * math.pi * k) / 8.0
            px = x + rx * math.cos(ang)
            py = y + ry * math.sin(ang)
            pz = z + rx * 0.5 * math.sin(ang)
            ring.append(Vector((px, py, pz)))
        slices.append(ring)
    return make_sculpted_curved_mesh(name, slices, mat=mat, parent=parent)

def make_curved_windshield(name, dash_w, mat=None, parent=None):
    """
    Constructs a curved compound aerodynamic glass windshield with authentic sagitta camber.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    nx = 24
    ny = 16
    grid = []
    half_w = dash_w * 0.47
    for j in range(ny):
        v = j / (ny - 1)
        y = 0.18 * (1.0 - v) + (-0.22) * v
        z = 0.76 * (1.0 - v) + 1.22 * v
        row = []
        for i in range(nx):
            u = -1.0 + 2.0 * (i / (nx - 1))
            x = u * (half_w * (1.0 - 0.18 * v))
            camber = 0.032 * (1.0 - u**2) * (1.0 - 0.15 * v)
            row.append(bm.verts.new(Vector((x, y + camber * 0.6, z + camber * 0.4))))
        grid.append(row)
    bm.verts.ensure_lookup_table()
    for j in range(ny - 1):
        for i in range(nx - 1):
            bm.faces.new([grid[j][i], grid[j][i+1], grid[j+1][i+1], grid[j+1][i]])
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
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

def make_sculpted_column_cowl(name, col_pos, col_rot, mat=None, parent=None):
    """
    Constructs a sculptural dual-cowl automotive steering column shroud with curved ergonomics,
    instrument cluster sightline cutouts, and soft parting shutlines.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_slices = 24
    pts_per_ring = 28
    half_len = 0.082
    R_mat = Euler(col_rot).to_matrix().to_4x4()
    rings = []
    for i in range(n_slices):
        t = i / (n_slices - 1)
        z = -half_len + 2.0 * half_len * t
        rx = 0.055 * (1.0 - 0.20 * t)
        ry = 0.048 * (1.0 - 0.18 * t)
        ring_verts = []
        for j in range(pts_per_ring):
            ang = (2.0 * math.pi * j) / pts_per_ring
            ca = math.cos(ang)
            sa = math.sin(ang)
            top_arch = 1.0 + (0.09 * math.cos(ang * 2.0) if sa > 0 else 0.0)
            local_p = Vector((rx * ca * top_arch, ry * sa, z))
            world_p = col_pos + R_mat @ local_p
            ring_verts.append(bm.verts.new(world_p))
        rings.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(n_slices - 1):
        for j in range(pts_per_ring):
            j_next = (j + 1) % pts_per_ring
            bm.faces.new([rings[i][j], rings[i][j_next], rings[i+1][j_next], rings[i+1][j]])
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1][::-1])
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def make_sculpted_stalk(name, base_pos, rot_euler, is_left=True, mat_stalk=None, mat_knurl=None, parent=None):
    """
    Constructs an ergonomic curved steering column control stalk (indicator / wiper)
    with sweeping reach toward the wheel rim, knurled rotary ring, and rounded thumb paddle.
    """
    sign = -1.0 if is_left else 1.0
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_rings = 22
    n_pts = 16
    stalk_len = 0.082
    R_mat = Euler(rot_euler).to_matrix().to_4x4()
    rings = []
    for i in range(n_rings):
        t = i / (n_rings - 1)
        lx = sign * (0.010 + t * stalk_len)
        ly = 0.016 * (t**1.8)
        lz = 0.014 * (t**1.5)
        base_r = 0.0055 * (1.0 - 0.12 * t)
        if t > 0.65:
            flair = 1.0 + 1.2 * math.sin((t - 0.65) / 0.35 * math.pi)
            rx = base_r * flair * 1.4
            ry = base_r * flair
        else:
            rx = base_r
            ry = base_r
        ring_verts = []
        for j in range(n_pts):
            ang = (2.0 * math.pi * j) / n_pts
            ca = math.cos(ang)
            sa = math.sin(ang)
            local_p = Vector((lx, ly + rx * ca, lz + ry * sa))
            world_p = base_pos + R_mat @ local_p
            ring_verts.append(bm.verts.new(world_p))
        rings.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(n_rings - 1):
        for j in range(n_pts):
            j_next = (j + 1) % n_pts
            bm.faces.new([rings[i][j], rings[i][j_next], rings[i+1][j_next], rings[i+1][j]])
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1][::-1])
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat_stalk:
        obj.data.materials.append(mat_stalk)
    if parent:
        attach_to_parent(obj, parent)

    # Knurled rotary switch ring
    knurl_t = 0.50
    knurl_lx = sign * (0.010 + knurl_t * stalk_len)
    knurl_ly = 0.016 * (knurl_t**1.8)
    knurl_lz = 0.014 * (knurl_t**1.5)
    knurl_pos = base_pos + R_mat @ Vector((knurl_lx, knurl_ly, knurl_lz))
    knurl_rot = Euler((rot_euler[0], rot_euler[1] + (math.radians(-90) if is_left else math.radians(90)), rot_euler[2]))
    make_knurled_cylinder(f"{name}_KNURL", knurl_pos, 0.0078, 0.014, knurl_rot, mat=mat_knurl, ridges=20, parent=obj)

    return obj

def make_sculpted_paddle_shifter(name, base_pos, rot_euler, is_left=True, mat=None, parent=None):
    """
    Constructs an ergonomic curved aluminum paddle shifter with tactile finger contours.
    """
    sign = -1.0 if is_left else 1.0
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_slices = 20
    pad_h = 0.098
    R_mat = Euler(rot_euler).to_matrix().to_4x4()
    rings = []
    for i in range(n_slices):
        t = i / (n_slices - 1)
        z = -pad_h * 0.5 + pad_h * t
        arc_x = sign * (0.008 * math.sin(t * math.pi))
        arc_y = -0.006 * math.sin(t * math.pi)
        w = 0.022 * (1.0 - 0.22 * (2.0 * t - 1.0)**2)
        th = 0.0045
        ring_pts = [
            Vector((arc_x - w * 0.5, arc_y - th * 0.5, z)),
            Vector((arc_x + w * 0.5, arc_y - th * 0.5, z)),
            Vector((arc_x + w * 0.5, arc_y + th * 0.5, z)),
            Vector((arc_x - w * 0.5, arc_y + th * 0.5, z)),
        ]
        ring_verts = [bm.verts.new(base_pos + R_mat @ pt) for pt in ring_pts]
        rings.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(n_slices - 1):
        for j in range(4):
            j_next = (j + 1) % 4
            bm.faces.new([rings[i][j], rings[i][j_next], rings[i+1][j_next], rings[i+1][j]])
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1][::-1])
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def make_sculpted_curved_spoke(name, boss_pos, rim_world_pos, rot_euler, w_start=0.038, w_end=0.024, th_start=0.010, th_end=0.006, mat=None, parent=None):
    """
    Constructs a sculpted 3D curved steering wheel spoke that fillets seamlessly
    from the center boss outward into the outer rim with organic cross-sections.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_slices = 16
    n_pts = 14
    R_mat = Euler(rot_euler).to_matrix().to_4x4()
    R_inv = R_mat.inverted()
    local_start = R_inv @ (boss_pos - boss_pos)
    local_end = R_inv @ (rim_world_pos - boss_pos)
    rings = []
    for i in range(n_slices):
        t = i / (n_slices - 1)
        lp = local_start * (1.0 - t) + local_end * t
        w = (w_start * (1.0 - t) + w_end * t) * (1.0 + 0.35 * (1.0 - t)**2 + 0.25 * t**2)
        th = th_start * (1.0 - t) + th_end * t
        lp.z += 0.0035 * math.sin(t * math.pi)
        dir_spoke = (local_end - local_start).normalized()
        perp = Vector((-dir_spoke.y, dir_spoke.x, 0.0)).normalized()
        ring_verts = []
        for j in range(n_pts):
            ang = (2.0 * math.pi * j) / n_pts
            ca = math.cos(ang)
            sa = math.sin(ang)
            cross_pt = lp + perp * (w * 0.5 * ca) + Vector((0, 0, th * 0.5 * sa))
            world_p = boss_pos + R_mat @ cross_pt
            ring_verts.append(bm.verts.new(world_p))
        rings.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(n_slices - 1):
        for j in range(n_pts):
            j_next = (j + 1) % n_pts
            bm.faces.new([rings[i][j], rings[i][j_next], rings[i+1][j_next], rings[i+1][j]])
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1][::-1])
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def make_sculpted_seat_unit(prefix, sx, cy, cz, width=0.46, length=0.46, back_h=0.56, is_center=False, has_shell=True, mats=None, parent=None, buckle_side="R"):
    """Procedural Class-A sculpted seat unit with bmesh bolsters, anatomical backrest, headrest, and seatbelt."""
    # Cushion
    bm_c = bmesh.new()
    nx, ny = (16, 14) if not is_center else (12, 12)
    w, l = width, length
    verts_c = []
    for j in range(ny + 1):
        v = j / ny
        y = cy + (v - 0.5) * l
        front_lift = 0.025 * math.sin(v * math.pi * 0.5)
        for i in range(nx + 1):
            u = i / nx
            x = sx + (u - 0.5) * w
            lat = abs(u - 0.5) * 2.0
            bolster_z = (0.065 if not is_center else 0.035) * (lat ** 2.0)
            center_dip = -0.012 * (1.0 - lat ** 2)
            flutes = 0.004 * math.sin(v * math.pi * 6.0) * (1.0 - lat ** 2)
            z = cz + front_lift + bolster_z + center_dip + flutes
            verts_c.append(bm_c.verts.new((x, y, z)))
    bm_c.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = verts_c[j * (nx + 1) + i]
            v2 = verts_c[j * (nx + 1) + i + 1]
            v3 = verts_c[(j + 1) * (nx + 1) + i + 1]
            v4 = verts_c[(j + 1) * (nx + 1) + i]
            bm_c.faces.new((v1, v2, v3, v4))
    for f in bm_c.faces: f.smooth = True
    m_c = bpy.data.meshes.new(f"SEAT_CUSHION_{prefix}_Mesh")
    bm_c.to_mesh(m_c)
    bm_c.free()
    obj_c = bpy.data.objects.new(f"SEAT_CUSHION_{prefix}", m_c)
    bpy.context.scene.collection.objects.link(obj_c)
    sol_c = obj_c.modifiers.new("Solidify", 'SOLIDIFY')
    sol_c.thickness = 0.075
    bpy.context.view_layer.objects.active = obj_c
    bpy.ops.object.modifier_apply(modifier="Solidify")
    obj_c.data.materials.append(mats["leather_ebony"])
    attach_to_parent(obj_c, parent)

    # Backrest
    bm_b = bmesh.new()
    bx_cnt, by_cnt = (18, 20) if not is_center else (14, 16)
    bw, bh = width * 0.96, back_h
    by_start = cy - l * 0.45
    bz_start = cz + 0.10
    verts_b = []
    for j in range(by_cnt + 1):
        v = j / by_cnt
        recline_y = -0.15 * v
        lumbar = 0.022 * math.sin(v * math.pi * 1.5)
        y = by_start + recline_y - lumbar
        z = bz_start + v * bh
        width_mod = 1.0 + (0.18 * math.sin((v - 0.65) / 0.35 * math.pi) if (v > 0.65 and not is_center) else 0.0)
        for i in range(bx_cnt + 1):
            u = i / bx_cnt
            lat = abs(u - 0.5) * 2.0
            x = sx + (u - 0.5) * bw * width_mod
            bolster_wrap = (0.070 if not is_center else 0.030) * (lat ** 2.0)
            flutes_b = 0.004 * math.sin(v * math.pi * 8.0) * (1.0 - lat ** 2)
            verts_b.append(bm_b.verts.new((x, y + bolster_wrap - flutes_b, z)))
    bm_b.verts.ensure_lookup_table()
    for j in range(by_cnt):
        for i in range(bx_cnt):
            v1 = verts_b[j * (bx_cnt + 1) + i]
            v2 = verts_b[j * (bx_cnt + 1) + i + 1]
            v3 = verts_b[(j + 1) * (bx_cnt + 1) + i + 1]
            v4 = verts_b[(j + 1) * (bx_cnt + 1) + i]
            bm_b.faces.new((v1, v2, v3, v4))
    for f in bm_b.faces: f.smooth = True
    m_b = bpy.data.meshes.new(f"SEAT_BACKREST_{prefix}_Mesh")
    bm_b.to_mesh(m_b)
    bm_b.free()
    obj_b = bpy.data.objects.new(f"SEAT_BACKREST_{prefix}", m_b)
    bpy.context.scene.collection.objects.link(obj_b)
    sol_b = obj_b.modifiers.new("Solidify", 'SOLIDIFY')
    sol_b.thickness = 0.055
    bpy.context.view_layer.objects.active = obj_b
    bpy.ops.object.modifier_apply(modifier="Solidify")
    obj_b.data.materials.append(mats["leather_ebony"])
    attach_to_parent(obj_b, parent)

    # Shell (if requested)
    if has_shell and not is_center:
        bm_sh = bmesh.new()
        sh_nx, sh_ny = 14, 18
        verts_sh = []
        for j in range(sh_ny + 1):
            v = j / sh_ny
            recline_y = -0.15 * v
            lumbar = 0.022 * math.sin(v * math.pi * 1.5)
            y = (by_start - 0.05) + recline_y - lumbar
            z = bz_start + v * bh
            for i in range(sh_nx + 1):
                u = i / sh_nx
                lat = abs(u - 0.5) * 2.0
                x = sx + (u - 0.5) * (bw + 0.02)
                shell_wrap = 0.08 * (lat ** 2.2)
                verts_sh.append(bm_sh.verts.new((x, y + shell_wrap, z)))
        bm_sh.verts.ensure_lookup_table()
        for j in range(sh_ny):
            for i in range(sh_nx):
                v1 = verts_sh[j * (sh_nx + 1) + i]
                v2 = verts_sh[j * (sh_nx + 1) + i + 1]
                v3 = verts_sh[(j + 1) * (sh_nx + 1) + i + 1]
                v4 = verts_sh[(j + 1) * (sh_nx + 1) + i]
                bm_sh.faces.new((v1, v2, v3, v4))
        for f in bm_sh.faces: f.smooth = True
        m_sh = bpy.data.meshes.new(f"SEAT_SHELL_{prefix}_Mesh")
        bm_sh.to_mesh(m_sh)
        bm_sh.free()
        obj_sh = bpy.data.objects.new(f"SEAT_SHELL_{prefix}", m_sh)
        bpy.context.scene.collection.objects.link(obj_sh)
        sol_sh = obj_sh.modifiers.new("Solidify", 'SOLIDIFY')
        sol_sh.thickness = 0.016
        bpy.context.view_layer.objects.active = obj_sh
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_sh.data.materials.append(mats["charcoal_trim"])
        attach_to_parent(obj_sh, parent)

    # Headrest
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=20, ring_count=14, radius=0.10 if not is_center else 0.08,
        location=(sx, by_start - 0.18, bz_start + bh + 0.11)
    )
    hr = bpy.context.active_object
    hr.name = f"SEAT_HEADREST_{prefix}"
    hr.scale = (1.10, 0.55, 0.85)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for p in hr.data.polygons: p.use_smooth = True
    hr.data.materials.append(mats["leather_ebony"])
    attach_to_parent(hr, parent)

    # Seatbelt Buckle & Strap
    buckle_offset_x = 0.14 if buckle_side == "R" else -0.14
    make_box(f"SEATBELT_BUCKLE_{prefix}", (sx + buckle_offset_x, cy - 0.02, cz + 0.14), (0.030, 0.050, 0.065), mats["charcoal_trim"], bevel=0.002, parent=parent)
    make_box(f"SEATBELT_RED_BTN_{prefix}", (sx + buckle_offset_x, cy - 0.02, cz + 0.175), (0.022, 0.030, 0.007), mats["gauge_needle_red"], bevel=0.001, parent=parent)
    strap_rot = Euler((math.radians(35), math.radians(-14 if buckle_side == "R" else 14), 0))
    make_box(f"SEATBELT_STRAP_{prefix}", (sx, cy - 0.22, cz + 0.35), (0.045, 0.003, 0.60), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=parent)

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

    # Roof Headliner in dark charcoal Alcantara (extended full 3-row cabin length)
    make_box("CABIN_ROOF_LINER", (0.0, -1.30, 1.25), (dash_w * 1.02, 3.20, 0.04), mats["headliner_alcantara"], bevel=0.015, parent=cabin_group)
    # Dual Panoramic Moonroof with Optical Glass
    make_box("CABIN_PANORAMIC_MOONROOF", (0.0, -1.30, 1.26), (dash_w * 0.70, 2.20, 0.015), mats["glass_optical"], bevel=0.005, parent=cabin_group)
    # Full Cabin Carpeted Floor Structure
    make_box("CABIN_CARPET_FLOOR", (0.0, -1.25, 0.02), (dash_w * 0.98, 3.10, 0.03), mats["charcoal_trim"], bevel=0.005, parent=cabin_group)
    # Overhead Center Dome Light Console & Reading Lamps
    make_box("CABIN_DOME_CONSOLE", (0.0, -0.16, 1.222), (0.19, 0.24, 0.024), mats["piano_black"], bevel=0.005, parent=cabin_group)
    make_cylinder("DOME_LAMP_L", (-0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_cylinder("DOME_LAMP_R", (0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_box("DOME_SUNGLASS_HATCH", (0.0, -0.22, 1.218), (0.12, 0.06, 0.012), mats["charcoal_trim"], bevel=0.002, parent=cabin_group)
    # Mid-Cabin B-Pillar Trim Liners
    make_box("CABIN_B_PILLAR_L", (-dash_w * 0.49, -0.92, 0.74), (0.05, 0.12, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    make_box("CABIN_B_PILLAR_R", (dash_w * 0.49, -0.92, 0.74), (0.05, 0.12, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    # Rear C-Pillar Trim Liners
    make_box("CABIN_C_PILLAR_L", (-dash_w * 0.49, -1.82, 0.74), (0.05, 0.14, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    make_box("CABIN_C_PILLAR_R", (dash_w * 0.49, -1.82, 0.74), (0.05, 0.14, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    # Rear Cabin Cargo Bulkhead Partition (Relocated behind Row 3)
    make_box("CABIN_REAR_BULKHEAD", (0.0, -2.85, 0.65), (dash_w * 1.02, 0.045, 1.18), mats["charcoal_trim"], bevel=0.012, parent=cabin_group)

    # Outer Left & Right A-Pillars in dark Alcantara headliner fabric (Aerodynamic Curved)
    make_curved_a_pillar("A_PILLAR_L", -1.0, dash_w, mats["headliner_alcantara"], parent=cabin_group)
    make_curved_a_pillar("A_PILLAR_R", 1.0, dash_w, mats["headliner_alcantara"], parent=cabin_group)
    # High-Frequency Audio Tweeter Grilles in base of A-pillars
    make_cylinder("TWEETER_GRILLE_L", (-dash_w * 0.46, 0.02, 0.77), 0.022, 0.008, (math.radians(45), math.radians(25), 0), mats["aluminum_brushed"], vertices=24, parent=cabin_group)
    make_cylinder("TWEETER_GRILLE_R", (dash_w * 0.46, 0.02, 0.77), 0.022, 0.008, (math.radians(45), math.radians(-25), 0), mats["aluminum_brushed"], vertices=24, parent=cabin_group)

    # Raked Curved Windshield Glass (True Compound Sagitta Camber)
    make_curved_windshield("CABIN_WINDSHIELD_AND_MIRROR", dash_w, mats["glass_optical"], parent=cabin_group)

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
    make_curved_upper_pad("DASH_UPPER_PAD", dash_w, mats["dash_upper_pad"], parent=dash_group)
    # Driver Arched Instrument Binnacle Cowl
    make_curved_binnacle_cowl("DASH_UPPER_COWL_BINNACLE", driver_x, mats["dash_upper_pad"], parent=dash_group)
    # Passenger Sculpted Concave Sweep
    make_curved_passenger_sweep("DASH_UPPER_PASS_SWEEP", pass_x, mats["dash_upper_pad"], parent=dash_group)

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

    # Lower Body, Glovebox, & Knee Bolsters (Sculpted Class-A Curved)
    make_sculpted_dash_main_body("DASH_MAIN_BODY", dash_w, mats["dash_main_cognac"], parent=dash_group)
    make_curved_glovebox("DASH_GLOVEBOX_PANEL", pass_x, mats["dash_main_cognac"], parent=dash_group)
    make_box("DASH_GLOVEBOX_HANDLE", (pass_x - 0.16, -0.065, 0.61), (0.048, 0.012, 0.018), mats["chrome_mirror"], bevel=0.002, parent=dash_group)
    make_cylinder("DASH_GLOVEBOX_LOCK", (pass_x - 0.16, -0.068, 0.61), 0.005, 0.006, (math.radians(90), 0, 0), mats["titanium_matte"], vertices=16, parent=dash_group)
    make_box("DASH_GLOVEBOX_SEAM", (pass_x, -0.048, 0.55), (0.52, 0.003, 0.20), mats["charcoal_trim"], bevel=0, parent=dash_group)
    make_curved_driver_knee_bolster("DASH_DRIVER_KNEE_BOLSTER", driver_x, mats["charcoal_trim"], parent=dash_group)

    # Decorative Trim Spear Across Dashboard
    trim_spear_obj = make_curved_trim_spear_mesh("DASH_TRIM_SPEAR", dash_w, mats["wood_walnut"], parent=dash_group)
    make_box("DASH_TRIM_CHROME_LIP", (0.0, -0.060, 0.670), (dash_w * 0.96, 0.012, 0.006), mats["chrome_mirror"], bevel=0.002, parent=dash_group)

    # ------------------------------------------------------------------------
    # 3. HVAC BRANCH (Central & Outboard Louvers)
    # ------------------------------------------------------------------------
    log("3. Modeling HVAC branch with turbine & dual-louver vanes...")
    hvac_group = bpy.data.objects.new("HVAC", None)
    bpy.context.scene.collection.objects.link(hvac_group)
    attach_to_parent(hvac_group, cockpit_master)

    make_curved_hvac_center_housing("DASH_HVAC_CENTER_HOUSING", mats["piano_black"], parent=hvac_group)
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

    # Binnacle Hood shading the instrument cluster (Arched Sculptural Canopy)
    make_curved_cluster_hood("CLUSTER_HOOD", driver_x, mats["charcoal_trim"], parent=cluster_group)
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

    # Column & Stalks (Sculpted Dual-Cowl & Ergonomic Curved Control Stalks)
    col_pos = steer_pos + Vector((0.0, 0.09, -0.018))
    make_sculpted_column_cowl("STEERING_COLUMN_AND_STALKS", col_pos, steer_rot, mat=mats["charcoal_trim"], parent=steering_group)
    stalk_l_pos = steer_world(Vector((-0.075, 0.03, -0.050)))
    make_sculpted_stalk("STEER_STALK_L", stalk_l_pos, steer_rot, is_left=True, mat_stalk=mats["charcoal_trim"], mat_knurl=mats["aluminum_brushed"], parent=steering_group)
    stalk_r_pos = steer_world(Vector((0.075, 0.03, -0.050)))
    make_sculpted_stalk("STEER_STALK_R", stalk_r_pos, steer_rot, is_left=False, mat_stalk=mats["charcoal_trim"], mat_knurl=mats["aluminum_brushed"], parent=steering_group)

    # Column-Mounted Ergonomic Curved Paddle Shifters (Left downshift, Right upshift)
    pad_l_pos = steer_world(Vector((-0.138, 0.020, -0.022)))
    make_sculpted_paddle_shifter("STEERING_PADDLE_SHIFTERS", pad_l_pos, steer_rot, is_left=True, mat=mats["aluminum_brushed"], parent=steering_group)
    pad_r_pos = steer_world(Vector((0.138, 0.020, -0.022)))
    make_sculpted_paddle_shifter("STEER_PADDLE_R", pad_r_pos, steer_rot, is_left=False, mat=mats["aluminum_brushed"], parent=steering_group)

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
    rim_l_pt = steer_world(Vector((-rim_r * 0.96, 0.0, 0.003)))
    rim_r_pt = steer_world(Vector((rim_r * 0.96, 0.0, 0.003)))
    rim_b_pt = steer_world(Vector((0.0, -rim_r * 0.96, 0.003)))
    make_sculpted_curved_spoke("STEER_SPORT_SPOKE_L", boss_pos, rim_l_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["aluminum_brushed"], parent=wheel_sport)
    make_sculpted_curved_spoke("STEER_SPORT_SPOKE_R", boss_pos, rim_r_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["aluminum_brushed"], parent=wheel_sport)
    make_sculpted_curved_spoke("STEER_SPORT_SPOKE_B", boss_pos, rim_b_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["aluminum_brushed"], parent=wheel_sport)

    # Button Pods
    btn_l_pos = steer_world(Vector((spoke_l_cx, 0.0, 0.008)))
    make_box("STEER_BTNS_L", btn_l_pos, (0.044, 0.026, 0.006), mats["piano_black"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)
    btn_r_pos = steer_world(Vector((-(spoke_l_cx), 0.0, 0.008)))
    make_box("STEER_BTNS_R", btn_r_pos, (0.044, 0.026, 0.006), mats["piano_black"], rot_euler=steer_rot, bevel=0.002, parent=wheel_sport)

    # 6.2 Wheel 2: GT 3-Spoke Flat-Bottom Wheel
    wheel_gt = bpy.data.objects.new("STEERING_GT_3SPOKE", None)
    bpy.context.scene.collection.objects.link(wheel_gt)
    attach_to_parent(wheel_gt, steering_group)
    make_sculpted_steering_rim("STEER_GT_RIM_SCULPT", steer_pos, steer_rot, rim_r, tube_r, is_flat_bottom=True, mat=mats["leather_perforated"], parent=wheel_gt)
    make_cylinder("STEER_GT_BOSS", boss_pos, boss_r, 0.020, steer_rot, mats["leather_ebony"], vertices=32, bevel=0.003, parent=wheel_gt)
    make_sculpted_curved_spoke("STEER_GT_SPOKE_L", boss_pos, rim_l_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["titanium_matte"], parent=wheel_gt)
    make_sculpted_curved_spoke("STEER_GT_SPOKE_R", boss_pos, rim_r_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["titanium_matte"], parent=wheel_gt)
    make_sculpted_curved_spoke("STEER_GT_SPOKE_B", boss_pos, rim_b_pt, steer_rot, w_start=0.038, w_end=0.024, mat=mats["titanium_matte"], parent=wheel_gt)
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
    make_curved_console_base("CONSOLE_BASE", mats["dash_main_cognac"], parent=console_root)
    # Curved Padded Knee Bolsters with Gold French Stitching following Waterfall
    make_curved_console_bolsters(console_root, mats["leather_ebony"], mats["stitch_gold"])

    # Flowing S-Curve Top Plate matching Waterfall Bridge
    make_curved_console_top_plate("CONSOLE_TOP_PLATE", mats["wood_walnut"], parent=console_root)
    make_box("CONSOLE_CHROME_BORDER", (0.0, -0.32, 0.490), (0.248, 0.628, 0.016), mats["chrome_mirror"], bevel=0.002, parent=console_root)

    # Cupholders with Ambient Light Ring
    make_cylinder("CONSOLE_CUPHOLDER_L", (-0.050, -0.42, 0.486), 0.038, 0.032, (0, 0, 0), mats["piano_black"], vertices=32, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_R", (0.050, -0.42, 0.486), 0.038, 0.032, (0, 0, 0), mats["piano_black"], vertices=32, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_CHROME", (0.0, -0.42, 0.501), 0.088, 0.003, (0, 0, 0), mats["chrome_mirror"], vertices=36, bevel=0.001, parent=console_root)
    make_cylinder("CONSOLE_CUPHOLDER_LIGHT_RING", (0.0, -0.42, 0.502), 0.086, 0.002, (0, 0, 0), mats["ambient_cyan"], vertices=36, parent=console_root)

    # Armrest Storage Compartment (Sculpted Double-Crowned Leather)
    make_curved_armrest("CONSOLE_ARMREST", mats["leather_ebony"], parent=console_root)
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
    # 8. DOORS BRANCH (Framing Driver & Passenger Sides - Sculpted Class-A Curves)
    # ------------------------------------------------------------------------
    log("8. Modeling DOORS branch with sculpted organic armrests & speakers...")
    doors_group = bpy.data.objects.new("DOORS", None)
    bpy.context.scene.collection.objects.link(doors_group)
    attach_to_parent(doors_group, cockpit_master)

    def make_sculpted_door_assembly(side_name, sign):
        bm_d = bmesh.new()
        nx, ny = 22, 20
        cx = sign * dash_w * 0.50
        cy = -0.35
        cz = 0.48
        slen = 0.82
        sh = 0.44

        verts_d = []
        for j in range(ny + 1):
            v = j / ny
            z = cz + (v - 0.5) * sh
            tumble_x = -sign * 0.035 * (v**1.8)
            armrest_bulge = 0.0
            if 0.35 < v < 0.75:
                armrest_bulge = -sign * 0.045 * math.sin((v - 0.35) / 0.40 * math.pi)

            for i in range(nx + 1):
                u = i / nx
                y = cy + (u - 0.5) * slen
                fwd_taper = -sign * 0.015 * u
                x = cx + tumble_x + armrest_bulge + fwd_taper
                verts_d.append(bm_d.verts.new((x, y, z)))

        bm_d.verts.ensure_lookup_table()
        for j in range(ny):
            for i in range(nx):
                v1 = verts_d[j * (nx + 1) + i]
                v2 = verts_d[j * (nx + 1) + i + 1]
                v3 = verts_d[(j + 1) * (nx + 1) + i + 1]
                v4 = verts_d[(j + 1) * (nx + 1) + i]
                bm_d.faces.new((v1, v2, v3, v4))

        for f in bm_d.faces:
            f.smooth = True
        m_d = bpy.data.meshes.new(f"DOOR_CARD_{side_name}_Mesh")
        bm_d.to_mesh(m_d)
        bm_d.free()

        obj_d = bpy.data.objects.new(f"DOOR_CARD_{side_name}", m_d)
        bpy.context.scene.collection.objects.link(obj_d)
        sol = obj_d.modifiers.new("Solidify", 'SOLIDIFY')
        sol.thickness = 0.025
        bpy.context.view_layer.objects.active = obj_d
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_d.data.materials.append(mats["dash_main_cognac"])
        attach_to_parent(obj_d, doors_group)

        make_box(f"DOOR_ARMREST_{side_name}", (cx - sign * 0.012, -0.32, 0.50), (0.068, 0.42, 0.080), mats["leather_ebony"], bevel=0.012, parent=doors_group)
        make_box(f"DOOR_HANDLE_CHROME_{side_name}", (cx - sign * 0.022, -0.18, 0.56), (0.025, 0.12, 0.035), mats["chrome_mirror"], bevel=0.003, parent=doors_group)
        spk = make_cylinder(f"DOOR_SPEAKER_{side_name}", (cx - sign * 0.015, -0.42, 0.40), 0.058, 0.010, (0, math.radians(90), 0), mats["speaker_acoustic"], vertices=32, parent=doors_group)
        unwrap_planar_uv(spk)
        make_cylinder(f"DOOR_SPK_CHROME_{side_name}", (cx - sign * 0.016, -0.42, 0.40), 0.060, 0.003, (0, math.radians(90), 0), mats["chrome_mirror"], vertices=32, parent=doors_group)
        make_box(f"DOOR_TRIM_SPEAR_{side_name}", (cx - sign * 0.016, -0.32, 0.58), (0.010, 0.68, 0.032), mats["wood_walnut"], bevel=0.002, parent=doors_group)
        make_box(f"DOOR_AMBIENT_{side_name}", (cx - sign * 0.018, -0.32, 0.565), (0.004, 0.66, 0.004), mats["ambient_cyan"], bevel=0, parent=doors_group)

    make_sculpted_door_assembly("L", -1.0)
    make_sculpted_door_assembly("R", 1.0)

    # ------------------------------------------------------------------------
    # 9. SEATS & BELTS BRANCH (Class-A Sculpted Sports Bucket Seats)
    # ------------------------------------------------------------------------
    log("9. Modeling SEATS branch with continuous high-density bmesh bolsters & carbon shells...")
    seats_group = bpy.data.objects.new("SEATS", None)
    bpy.context.scene.collection.objects.link(seats_group)
    attach_to_parent(seats_group, cockpit_master)

    for s_side, sx in [("DRIVER", driver_x), ("PASS", pass_x)]:
        seat_unit_root = bpy.data.objects.new(f"SEAT_UNIT_{s_side}", None)
        bpy.context.scene.collection.objects.link(seat_unit_root)
        attach_to_parent(seat_unit_root, seats_group)

        cy = -0.48
        cz = 0.20

        # 9.1 Sculpted Seat Bottom Cushion (24x20 quad bmesh with ergonomic thigh bolsters & fluted ribs)
        bm_c = bmesh.new()
        nx, ny = 24, 20
        w, l = 0.48, 0.48
        verts_c = []
        for j in range(ny + 1):
            v = j / ny
            y = cy + (v - 0.5) * l
            front_lift = 0.03 * math.sin(v * math.pi * 0.5)
            for i in range(nx + 1):
                u = i / nx
                x = sx + (u - 0.5) * w
                lat = abs(u - 0.5) * 2.0
                bolster_z = 0.085 * (lat ** 2.2)
                center_dip = -0.015 * (1.0 - lat**2)
                flutes = 0.005 * math.sin(v * math.pi * 6.0) * (1.0 - lat**2)
                z = cz + front_lift + bolster_z + center_dip + flutes
                verts_c.append(bm_c.verts.new((x, y, z)))
        bm_c.verts.ensure_lookup_table()
        for j in range(ny):
            for i in range(nx):
                v1 = verts_c[j * (nx + 1) + i]
                v2 = verts_c[j * (nx + 1) + i + 1]
                v3 = verts_c[(j + 1) * (nx + 1) + i + 1]
                v4 = verts_c[(j + 1) * (nx + 1) + i]
                bm_c.faces.new((v1, v2, v3, v4))
        for f in bm_c.faces:
            f.smooth = True
        m_c = bpy.data.meshes.new(f"SEAT_CUSHION_{s_side}_Mesh")
        bm_c.to_mesh(m_c)
        bm_c.free()
        obj_c = bpy.data.objects.new(f"SEAT_CUSHION_{s_side}", m_c)
        bpy.context.scene.collection.objects.link(obj_c)
        sol_c = obj_c.modifiers.new("Solidify", 'SOLIDIFY')
        sol_c.thickness = 0.08
        bpy.context.view_layer.objects.active = obj_c
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_c.data.materials.append(mats["leather_ebony"])
        attach_to_parent(obj_c, seat_unit_root)

        # 9.2 Sculpted Anatomical Backrest (24x28 quad bmesh with S-spine lumbar, shoulder wings & fluted ribs)
        bm_b = bmesh.new()
        bx_cnt, by_cnt = 24, 28
        bw, bh = 0.46, 0.58
        by_start = cy - l * 0.45
        bz_start = cz + 0.12
        verts_b = []
        for j in range(by_cnt + 1):
            v = j / by_cnt
            recline_y = -0.16 * v
            lumbar = 0.025 * math.sin(v * math.pi * 1.5)
            y = by_start + recline_y - lumbar
            z = bz_start + v * bh
            width_mod = 1.0 + (0.22 * math.sin((v - 0.65) / 0.35 * math.pi) if v > 0.65 else 0.0)

            for i in range(bx_cnt + 1):
                u = i / bx_cnt
                lat = abs(u - 0.5) * 2.0
                x = sx + (u - 0.5) * bw * width_mod
                bolster_wrap = 0.085 * (lat ** 2.0)
                if v > 0.6:
                    bolster_wrap += 0.035 * (lat ** 1.5)
                flutes_b = 0.005 * math.sin(v * math.pi * 8.0) * (1.0 - lat**2)
                verts_b.append(bm_b.verts.new((x, y + bolster_wrap - flutes_b, z)))

        bm_b.verts.ensure_lookup_table()
        for j in range(by_cnt):
            for i in range(bx_cnt):
                v1 = verts_b[j * (bx_cnt + 1) + i]
                v2 = verts_b[j * (bx_cnt + 1) + i + 1]
                v3 = verts_b[(j + 1) * (bx_cnt + 1) + i + 1]
                v4 = verts_b[(j + 1) * (bx_cnt + 1) + i]
                bm_b.faces.new((v1, v2, v3, v4))
        for f in bm_b.faces:
            f.smooth = True
        m_b = bpy.data.meshes.new(f"SEAT_BACKREST_{s_side}_Mesh")
        bm_b.to_mesh(m_b)
        bm_b.free()
        obj_b = bpy.data.objects.new(f"SEAT_BACKREST_{s_side}", m_b)
        bpy.context.scene.collection.objects.link(obj_b)
        sol_b = obj_b.modifiers.new("Solidify", 'SOLIDIFY')
        sol_b.thickness = 0.06
        bpy.context.view_layer.objects.active = obj_b
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_b.data.materials.append(mats["leather_ebony"])
        attach_to_parent(obj_b, seat_unit_root)

        # 9.3 Autoclaved Carbon Fiber Rear Shell (Curved compound bucket shell wrapping sides)
        bm_sh = bmesh.new()
        sh_nx, sh_ny = 20, 24
        verts_sh = []
        for j in range(sh_ny + 1):
            v = j / sh_ny
            recline_y = -0.16 * v
            lumbar = 0.025 * math.sin(v * math.pi * 1.5)
            y = (by_start - 0.06) + recline_y - lumbar
            z = bz_start + v * bh
            for i in range(sh_nx + 1):
                u = i / sh_nx
                lat = abs(u - 0.5) * 2.0
                x = sx + (u - 0.5) * (bw + 0.02)
                shell_wrap = 0.10 * (lat ** 2.2)
                verts_sh.append(bm_sh.verts.new((x, y + shell_wrap, z)))
        bm_sh.verts.ensure_lookup_table()
        for j in range(sh_ny):
            for i in range(sh_nx):
                v1 = verts_sh[j * (sh_nx + 1) + i]
                v2 = verts_sh[j * (sh_nx + 1) + i + 1]
                v3 = verts_sh[(j + 1) * (sh_nx + 1) + i + 1]
                v4 = verts_sh[(j + 1) * (sh_nx + 1) + i]
                bm_sh.faces.new((v1, v2, v3, v4))
        for f in bm_sh.faces:
            f.smooth = True
        m_sh = bpy.data.meshes.new(f"SEAT_SHELL_{s_side}_Mesh")
        bm_sh.to_mesh(m_sh)
        bm_sh.free()
        obj_sh = bpy.data.objects.new(f"SEAT_SHELL_{s_side}", m_sh)
        bpy.context.scene.collection.objects.link(obj_sh)
        sol_sh = obj_sh.modifiers.new("Solidify", 'SOLIDIFY')
        sol_sh.thickness = 0.018
        bpy.context.view_layer.objects.active = obj_sh
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_sh.data.materials.append(mats["carbon_twill"])
        attach_to_parent(obj_sh, seat_unit_root)

        # 9.4 Integrated Ergonomic Headrest
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=18, radius=0.11,
            location=(sx, by_start - 0.20, bz_start + bh + 0.12)
        )
        hr = bpy.context.active_object
        hr.name = f"SEAT_HEADREST_{s_side}"
        hr.scale = (1.12, 0.58, 0.88)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for p in hr.data.polygons: p.use_smooth = True
        hr.data.materials.append(mats["leather_ebony"])
        attach_to_parent(hr, seat_unit_root)

        # 9.5 Twin Racing Harness Pass-Through Bezels
        for hx, h_sign in [(-0.065, "L"), (0.065, "R")]:
            make_cylinder(f"SEAT_HARNESS_{h_sign}_{s_side}", (sx + hx, by_start - 0.16, bz_start + bh - 0.02), 0.026, 0.04, (math.radians(78), 0, 0), mats["titanium_matte"], vertices=24, bevel=0.003, parent=seat_unit_root)

        # 9.6 Seatbelt Buckle & Webbing
        buckle_x = sx + (0.16 if s_side == "DRIVER" else -0.16)
        make_box(f"SEATBELT_BUCKLE_{s_side}", (buckle_x, -0.38, 0.35), (0.032, 0.055, 0.075), mats["charcoal_trim"], bevel=0.003, parent=seat_unit_root)
        make_box(f"SEATBELT_RED_BTN_{s_side}", (buckle_x, -0.38, 0.39), (0.024, 0.035, 0.008), mats["gauge_needle_red"], bevel=0.001, parent=seat_unit_root)
        strap_rot = Euler((math.radians(35), math.radians(-15 if s_side == "DRIVER" else 15), 0))
        make_box(f"SEATBELT_STRAP_{s_side}", (sx, -0.62, 0.55), (0.048, 0.003, 0.65), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=seat_unit_root)

    # Helper function to generate modular sculpted seat units for Row 2 and Row 3
    def make_sculpted_seat_unit(unit_id, sx, cy, cz, width=0.46, length=0.48, back_h=0.56, is_center=False, has_shell=True, mats=None, parent=None, buckle_side="R"):
        seat_root = bpy.data.objects.new(f"SEAT_{unit_id}", None)
        bpy.context.scene.collection.objects.link(seat_root)
        if parent:
            attach_to_parent(seat_root, parent)

        # 1. Seat Cushion bmesh
        bm_c = bmesh.new()
        nx, ny = (16, 14) if is_center else (20, 18)
        w, l = width, length
        verts_c = []
        for j in range(ny + 1):
            v = j / ny
            y = cy + (v - 0.5) * l
            front_lift = 0.025 * math.sin(v * math.pi * 0.5)
            for i in range(nx + 1):
                u = i / nx
                x = sx + (u - 0.5) * w
                lat = abs(u - 0.5) * 2.0
                bolster_z = (0.045 if is_center else 0.075) * (lat ** 2.0)
                center_dip = -0.012 * (1.0 - lat**2)
                flutes = 0.004 * math.sin(v * math.pi * 5.0) * (1.0 - lat**2)
                z = cz + front_lift + bolster_z + center_dip + flutes
                verts_c.append(bm_c.verts.new((x, y, z)))
        bm_c.verts.ensure_lookup_table()
        for j in range(ny):
            for i in range(nx):
                v1 = verts_c[j * (nx + 1) + i]
                v2 = verts_c[j * (nx + 1) + i + 1]
                v3 = verts_c[(j + 1) * (nx + 1) + i + 1]
                v4 = verts_c[(j + 1) * (nx + 1) + i]
                bm_c.faces.new((v1, v2, v3, v4))
        for f in bm_c.faces:
            f.smooth = True
        m_c = bpy.data.meshes.new(f"SEAT_CUSHION_{unit_id}_Mesh")
        bm_c.to_mesh(m_c)
        bm_c.free()
        obj_c = bpy.data.objects.new(f"SEAT_CUSHION_{unit_id}", m_c)
        bpy.context.scene.collection.objects.link(obj_c)
        sol_c = obj_c.modifiers.new("Solidify", 'SOLIDIFY')
        sol_c.thickness = 0.07
        bpy.context.view_layer.objects.active = obj_c
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_c.data.materials.append(mats["leather_ebony"])
        attach_to_parent(obj_c, seat_root)

        # 2. Backrest bmesh
        bm_b = bmesh.new()
        bx_cnt, by_cnt = (16, 20) if is_center else (20, 24)
        bw, bh = width, back_h
        by_start = cy - l * 0.44
        bz_start = cz + 0.10
        verts_b = []
        for j in range(by_cnt + 1):
            v = j / by_cnt
            recline_y = -0.14 * v
            lumbar = 0.020 * math.sin(v * math.pi * 1.5)
            y = by_start + recline_y - lumbar
            z = bz_start + v * bh
            width_mod = 1.0 + (0.15 * math.sin((v - 0.65) / 0.35 * math.pi) if (v > 0.65 and not is_center) else 0.0)
            for i in range(bx_cnt + 1):
                u = i / bx_cnt
                lat = abs(u - 0.5) * 2.0
                x = sx + (u - 0.5) * bw * width_mod
                bolster_wrap = (0.04 if is_center else 0.07) * (lat ** 2.0)
                flutes_b = 0.004 * math.sin(v * math.pi * 6.0) * (1.0 - lat**2)
                verts_b.append(bm_b.verts.new((x, y + bolster_wrap - flutes_b, z)))
        bm_b.verts.ensure_lookup_table()
        for j in range(by_cnt):
            for i in range(bx_cnt):
                v1 = verts_b[j * (bx_cnt + 1) + i]
                v2 = verts_b[j * (bx_cnt + 1) + i + 1]
                v3 = verts_b[(j + 1) * (bx_cnt + 1) + i + 1]
                v4 = verts_b[(j + 1) * (bx_cnt + 1) + i]
                bm_b.faces.new((v1, v2, v3, v4))
        for f in bm_b.faces:
            f.smooth = True
        m_b = bpy.data.meshes.new(f"SEAT_BACKREST_{unit_id}_Mesh")
        bm_b.to_mesh(m_b)
        bm_b.free()
        obj_b = bpy.data.objects.new(f"SEAT_BACKREST_{unit_id}", m_b)
        bpy.context.scene.collection.objects.link(obj_b)
        sol_b = obj_b.modifiers.new("Solidify", 'SOLIDIFY')
        sol_b.thickness = 0.05
        bpy.context.view_layer.objects.active = obj_b
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_b.data.materials.append(mats["leather_ebony"])
        attach_to_parent(obj_b, seat_root)

        # 3. Optional Composite Rear Shell
        if has_shell:
            bm_sh = bmesh.new()
            sh_nx, sh_ny = 16, 20
            verts_sh = []
            for j in range(sh_ny + 1):
                v = j / sh_ny
                recline_y = -0.14 * v
                lumbar = 0.020 * math.sin(v * math.pi * 1.5)
                y = (by_start - 0.05) + recline_y - lumbar
                z = bz_start + v * bh
                for i in range(sh_nx + 1):
                    u = i / sh_nx
                    lat = abs(u - 0.5) * 2.0
                    x = sx + (u - 0.5) * (bw + 0.02)
                    shell_wrap = 0.08 * (lat ** 2.0)
                    verts_sh.append(bm_sh.verts.new((x, y + shell_wrap, z)))
            bm_sh.verts.ensure_lookup_table()
            for j in range(sh_ny):
                for i in range(sh_nx):
                    v1 = verts_sh[j * (sh_nx + 1) + i]
                    v2 = verts_sh[j * (sh_nx + 1) + i + 1]
                    v3 = verts_sh[(j + 1) * (sh_nx + 1) + i + 1]
                    v4 = verts_sh[(j + 1) * (sh_nx + 1) + i]
                    bm_sh.faces.new((v1, v2, v3, v4))
            for f in bm_sh.faces:
                f.smooth = True
            m_sh = bpy.data.meshes.new(f"SEAT_SHELL_{unit_id}_Mesh")
            bm_sh.to_mesh(m_sh)
            bm_sh.free()
            obj_sh = bpy.data.objects.new(f"SEAT_SHELL_{unit_id}", m_sh)
            bpy.context.scene.collection.objects.link(obj_sh)
            sol_sh = obj_sh.modifiers.new("Solidify", 'SOLIDIFY')
            sol_sh.thickness = 0.015
            bpy.context.view_layer.objects.active = obj_sh
            bpy.ops.object.modifier_apply(modifier="Solidify")
            obj_sh.data.materials.append(mats["carbon_twill"])
            attach_to_parent(obj_sh, seat_root)

        # 4. Integrated Ergonomic Headrest
        hr_rad = 0.09 if is_center else 0.10
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=16, radius=hr_rad,
            location=(sx, by_start - 0.18, bz_start + bh + 0.10)
        )
        hr = bpy.context.active_object
        hr.name = f"SEAT_HEADREST_{unit_id}"
        hr.scale = (1.08, 0.58, 0.85)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for p in hr.data.polygons: p.use_smooth = True
        hr.data.materials.append(mats["leather_ebony"])
        attach_to_parent(hr, seat_root)

        # 5. Seatbelt Buckle
        b_offset = 0.14 if buckle_side == "L" else -0.14
        buckle_x = sx + b_offset
        make_box(f"SEATBELT_BUCKLE_{unit_id}", (buckle_x, cy + 0.08, cz + 0.14), (0.030, 0.050, 0.070), mats["charcoal_trim"], bevel=0.003, parent=seat_root)
        make_box(f"SEATBELT_RED_BTN_{unit_id}", (buckle_x, cy + 0.08, cz + 0.178), (0.022, 0.030, 0.006), mats["gauge_needle_red"], bevel=0.001, parent=seat_root)

        # 6. Seatbelt Webbing Strap
        strap_sign = -1 if buckle_side == "L" else 1
        strap_rot = Euler((math.radians(32), math.radians(12 * strap_sign), 0))
        make_box(f"SEATBELT_{unit_id}", (sx, cy - 0.14, cz + 0.35), (0.046, 0.003, 0.60), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=seat_root)

        return seat_root

    # ------------------------------------------------------------------------
    # 9.B. ROW 2 SEATS (Back Seats / Second Row Cabin)
    # ------------------------------------------------------------------------
    log("9.B Modeling ROW 2 SEATS (Outboard L/R, Center Bench, Fold-Down Armrest, Captain Console)...")
    seats_row2_group = bpy.data.objects.new("SEATS_ROW2", None)
    bpy.context.scene.collection.objects.link(seats_row2_group)
    attach_to_parent(seats_row2_group, cockpit_master)

    r2_y = -1.35
    r2_z = 0.22

    # Left & Right Outboard Seats (Row 2)
    make_sculpted_seat_unit("ROW2_L", -0.42, r2_y, r2_z, width=0.46, length=0.48, back_h=0.56, is_center=False, has_shell=True, mats=mats, parent=seats_row2_group, buckle_side="R")
    make_sculpted_seat_unit("ROW2_R", 0.42, r2_y, r2_z, width=0.46, length=0.48, back_h=0.56, is_center=False, has_shell=True, mats=mats, parent=seats_row2_group, buckle_side="L")

    # Center Seat for Row 2 (40/20/40 Split Bench)
    make_sculpted_seat_unit("ROW2_C", 0.0, r2_y, r2_z, width=0.34, length=0.46, back_h=0.52, is_center=True, has_shell=False, mats=mats, parent=seats_row2_group, buckle_side="R")

    # Executive Fold-Down Center Armrest (Positioned in center of Row 2)
    make_box("SEAT_ROW2_ARMREST_CONSOLE", (0.0, r2_y - 0.04, r2_z + 0.22), (0.24, 0.38, 0.12), mats["leather_ebony"], bevel=0.012, parent=seats_row2_group)
    make_cylinder("REAR_ARMREST_CUPHOLDER_L", (-0.055, r2_y + 0.06, r2_z + 0.28), 0.035, 0.045, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_cylinder("REAR_ARMREST_CUPHOLDER_R", (0.055, r2_y + 0.06, r2_z + 0.28), 0.035, 0.045, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_box("REAR_ARMREST_TOUCH_SCREEN", (0.0, r2_y - 0.08, r2_z + 0.285), (0.14, 0.08, 0.005), mats["screen_infotainment"], bevel=0.002, parent=seats_row2_group)

    # Executive Captain Chairs Center Console (For VIP / 6-7 Seater Luxury)
    make_box("SEAT_ROW2_CAPTAIN_CONSOLE", (0.0, r2_y, r2_z + 0.12), (0.22, 0.72, 0.26), mats["charcoal_trim"], bevel=0.015, parent=seats_row2_group)
    make_box("REAR_CAPTAIN_TRIM_SPEAR", (0.0, r2_y, r2_z + 0.255), (0.20, 0.68, 0.010), mats["wood_walnut"], bevel=0.003, parent=seats_row2_group)
    make_cylinder("REAR_CAPTAIN_CUPHOLDER_1", (0.0, r2_y + 0.16, r2_z + 0.26), 0.038, 0.050, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_cylinder("REAR_CAPTAIN_CUPHOLDER_2", (0.0, r2_y + 0.06, r2_z + 0.26), 0.038, 0.050, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)

    # ------------------------------------------------------------------------
    # 9.C. REAR CABIN AMENITIES (Entertainment, Climate, Tables)
    # ------------------------------------------------------------------------
    log("9.C Modeling REAR CABIN AMENITIES (Rear HVAC Console, Seatback OLEDs, Theater Screen, Tray Tables)...")
    rear_amenities_group = bpy.data.objects.new("REAR_AMENITIES", None)
    bpy.context.scene.collection.objects.link(rear_amenities_group)
    attach_to_parent(rear_amenities_group, cockpit_master)

    # Rear HVAC Center Console (Mounted behind front center console)
    make_box("REAR_CONSOLE_HVAC", (0.0, -0.74, 0.44), (0.26, 0.14, 0.26), mats["charcoal_trim"], bevel=0.010, parent=rear_amenities_group)
    make_box("REAR_HVAC_VENT_L", (-0.06, -0.795, 0.50), (0.08, 0.02, 0.045), mats["aluminum_brushed"], bevel=0.002, parent=rear_amenities_group)
    make_box("REAR_HVAC_VENT_R", (0.06, -0.795, 0.50), (0.08, 0.02, 0.045), mats["aluminum_brushed"], bevel=0.002, parent=rear_amenities_group)
    make_box("REAR_HVAC_SCREEN", (0.0, -0.802, 0.43), (0.12, 0.015, 0.05), mats["screen_infotainment"], bevel=0.002, parent=rear_amenities_group)
    make_cylinder("REAR_HVAC_DIAL_L", (-0.06, -0.805, 0.36), 0.016, 0.014, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=24, parent=rear_amenities_group)
    make_cylinder("REAR_HVAC_DIAL_R", (0.06, -0.805, 0.36), 0.016, 0.014, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=24, parent=rear_amenities_group)

    # Dual 11.6" Seatback 4K OLED Entertainment Displays (on front seatbacks)
    make_box("REAR_SEATBACK_SCREEN_L", (driver_x, -0.84, 0.68), (0.28, 0.015, 0.17), mats["screen_infotainment"], bevel=0.003, parent=rear_amenities_group)
    make_box("REAR_SEATBACK_SCREEN_R", (pass_x, -0.84, 0.68), (0.28, 0.015, 0.17), mats["screen_infotainment"], bevel=0.003, parent=rear_amenities_group)

    # Billet Aluminum Folding Tray Tables (on front seatbacks)
    make_box("REAR_FOLDING_TABLE_L", (driver_x, -0.82, 0.50), (0.32, 0.20, 0.012), mats["aluminum_brushed"], bevel=0.004, parent=rear_amenities_group)
    make_box("REAR_FOLDING_TABLE_R", (pass_x, -0.82, 0.50), (0.32, 0.20, 0.012), mats["aluminum_brushed"], bevel=0.004, parent=rear_amenities_group)

    # Ceiling-Deployable 31" 8K Panoramic Theater Screen
    make_box("REAR_THEATER_SCREEN_31IN", (0.0, -0.96, 1.16), (0.80, 0.018, 0.25), mats["screen_infotainment"], bevel=0.004, parent=rear_amenities_group)

    # ------------------------------------------------------------------------
    # 9.D. ROW 3 SEATS (Third Row for 7-Seater & 8-Seater)
    # ------------------------------------------------------------------------
    log("9.D Modeling ROW 3 SEATS (Third Row Outboard L/R, Center Seat, Side Armrests)...")
    seats_row3_group = bpy.data.objects.new("SEATS_ROW3", None)
    bpy.context.scene.collection.objects.link(seats_row3_group)
    attach_to_parent(seats_row3_group, cockpit_master)

    r3_y = -2.18
    r3_z = 0.28 # Elevated stadium seating height

    # Outboard Left and Right Seats (Row 3)
    make_sculpted_seat_unit("ROW3_L", -0.36, r3_y, r3_z, width=0.42, length=0.44, back_h=0.52, is_center=False, has_shell=True, mats=mats, parent=seats_row3_group, buckle_side="R")
    make_sculpted_seat_unit("ROW3_R", 0.36, r3_y, r3_z, width=0.42, length=0.44, back_h=0.52, is_center=False, has_shell=True, mats=mats, parent=seats_row3_group, buckle_side="L")

    # Center Seat for Row 3 (Active in 8-Seater Configuration)
    make_sculpted_seat_unit("ROW3_C", 0.0, r3_y, r3_z, width=0.32, length=0.44, back_h=0.50, is_center=True, has_shell=False, mats=mats, parent=seats_row3_group, buckle_side="R")

    # Third Row Quarter Trim Side Armrests with Cupholders
    make_box("ROW3_ARMREST_L", (-0.60, r3_y, r3_z + 0.16), (0.12, 0.42, 0.10), mats["charcoal_trim"], bevel=0.010, parent=seats_row3_group)
    make_cylinder("ROW3_CUPHOLDER_L", (-0.60, r3_y + 0.08, r3_z + 0.21), 0.034, 0.040, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row3_group)
    make_box("ROW3_ARMREST_R", (0.60, r3_y, r3_z + 0.16), (0.12, 0.42, 0.10), mats["charcoal_trim"], bevel=0.010, parent=seats_row3_group)
    make_cylinder("ROW3_CUPHOLDER_R", (0.60, r3_y + 0.08, r3_z + 0.21), 0.034, 0.040, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row3_group)

    # ------------------------------------------------------------------------
    # 9.E. EXECUTIVE LUXURY LOUNGE (Spacious LWB Amenities)
    # ------------------------------------------------------------------------
    log("9.E Modeling EXECUTIVE LUXURY LOUNGE (Calf Ottomans, Champagne Chiller Bar, 31in Theater Mount)...")
    luxury_lounge_group = bpy.data.objects.new("LUXURY_REAR_LOUNGE", None)
    bpy.context.scene.collection.objects.link(luxury_lounge_group)
    attach_to_parent(luxury_lounge_group, cockpit_master)

    # 1. Deployable Motorized Calf Support Ottomans (Extended forward from Row 2)
    rot_ottoman = Euler((math.radians(-25), 0, 0))
    make_box("LUXURY_OTTOMAN_L", (-0.42, r2_y + 0.32, r2_z + 0.12), (0.40, 0.26, 0.075), mats["leather_ebony"], rot_euler=rot_ottoman, bevel=0.010, parent=luxury_lounge_group)
    make_cylinder("OTTOMAN_HINGE_L", (-0.42, r2_y + 0.22, r2_z + 0.16), 0.020, 0.42, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=24, parent=luxury_lounge_group)

    make_box("LUXURY_OTTOMAN_R", (0.42, r2_y + 0.32, r2_z + 0.12), (0.40, 0.26, 0.075), mats["leather_ebony"], rot_euler=rot_ottoman, bevel=0.010, parent=luxury_lounge_group)
    make_cylinder("OTTOMAN_HINGE_R", (0.42, r2_y + 0.22, r2_z + 0.16), 0.020, 0.42, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=24, parent=luxury_lounge_group)

    # 2. Refrigerated Dual Champagne Chiller Console Bar
    make_box("LUXURY_CHAMPAGNE_CHILLER", (0.0, r2_y - 0.18, r2_z + 0.28), (0.24, 0.34, 0.28), mats["piano_black"], bevel=0.012, parent=luxury_lounge_group)
    make_box("CHAMPAGNE_CHILLER_TRIM", (0.0, r2_y - 0.18, r2_z + 0.422), (0.22, 0.32, 0.008), mats["aluminum_brushed"], bevel=0.002, parent=luxury_lounge_group)
    make_box("CHAMPAGNE_CHILLER_DOOR", (0.0, r2_y - 0.01, r2_z + 0.34), (0.20, 0.012, 0.16), mats["frosted_chiller_glass"], bevel=0.003, parent=luxury_lounge_group)
    make_cylinder("CHAMPAGNE_DOOR_HANDLE", (0.0, r2_y - 0.002, r2_z + 0.34), 0.008, 0.14, (0, math.radians(90), 0), mats["chrome_mirror"], vertices=16, parent=luxury_lounge_group)

    # Digital Chiller Temperature Display Screen ("6°C")
    make_box("CHAMPAGNE_TEMP_DISPLAY", (0.0, r2_y - 0.015, r2_z + 0.435), (0.065, 0.006, 0.022), mats["hud_cyan"], bevel=0.001, parent=luxury_lounge_group)

    # 2 Hand-Blown Crystal Champagne Flutes
    flute_rot = (0, 0, 0)
    make_cylinder("CHAMPAGNE_FLUTE_1", (-0.055, r2_y - 0.14, r2_z + 0.38), 0.024, 0.14, flute_rot, mats["crystal_faceted"], vertices=24, parent=luxury_lounge_group)
    make_cylinder("CHAMPAGNE_FLUTE_2", (0.055, r2_y - 0.14, r2_z + 0.38), 0.024, 0.14, flute_rot, mats["crystal_faceted"], vertices=24, parent=luxury_lounge_group)

    # 3. 31.3" Panoramic Theater Screen Ceiling Pocket & Articulating Hinge Mounts
    make_box("THEATER_CEILING_POCKET", (0.0, -0.96, 1.22), (0.86, 0.22, 0.045), mats["charcoal_trim"], bevel=0.008, parent=luxury_lounge_group)
    make_cylinder("THEATER_HINGE_L", (-0.32, -0.96, 1.20), 0.014, 0.040, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=20, parent=luxury_lounge_group)
    make_cylinder("THEATER_HINGE_R", (0.32, -0.96, 1.20), 0.014, 0.040, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=20, parent=luxury_lounge_group)

    # ------------------------------------------------------------------------
    # 9.F. HEAVY-DUTY TRUCK WORKSTATION (4WD Selector, Auxiliary Switchpod, Vault, Air Brakes)
    # ------------------------------------------------------------------------
    log("9.F Modeling HEAVY-DUTY TRUCK WORKSTATION (Air Brakes, 4WD Dial, Aux Switchpod, Trailer Brake, CB Radio, Vault)...")
    truck_workstation_group = bpy.data.objects.new("TRUCK_WORKSTATION", None)
    bpy.context.scene.collection.objects.link(truck_workstation_group)
    attach_to_parent(truck_workstation_group, cockpit_master)

    # 1. Rotary Electronic 4WD Mode Transfer Case Dial
    make_box("TRUCK_4WD_SELECTOR_BEZEL", (-0.16, -0.22, 0.52), (0.075, 0.075, 0.014), mats["charcoal_trim"], bevel=0.004, parent=truck_workstation_group)
    dial_rot = (math.radians(18), 0, 0)
    make_cylinder("TRUCK_4WD_SELECTOR_DIAL", (-0.16, -0.22, 0.534), 0.028, 0.022, dial_rot, mats["aluminum_brushed"], vertices=32, parent=truck_workstation_group)
    make_cylinder("CONSOLE_4WD_DIAL", (-0.16, -0.22, 0.546), 0.020, 0.008, dial_rot, mats["rubber_traction"], vertices=24, parent=truck_workstation_group)
    # 4WD Mode Status Indicators (2H, 4H, 4L)
    make_box("TRUCK_4WD_IND_2H", (-0.18, -0.19, 0.530), (0.012, 0.006, 0.004), mats["led_emerald"], bevel=0.001, parent=truck_workstation_group)
    make_box("TRUCK_4WD_IND_4H", (-0.16, -0.185, 0.530), (0.012, 0.006, 0.004), mats["led_amber"], bevel=0.001, parent=truck_workstation_group)
    make_box("TRUCK_4WD_IND_4L", (-0.14, -0.19, 0.530), (0.012, 0.006, 0.004), mats["led_amber"], bevel=0.001, parent=truck_workstation_group)

    # 2. Integrated Trailer Brake Controller Module (Driver Right Knee/Stack)
    make_box("TRUCK_TRAILER_BRAKE_BEZEL", (-0.24, -0.16, 0.50), (0.09, 0.045, 0.065), mats["charcoal_trim"], bevel=0.003, parent=truck_workstation_group)
    make_box("TRUCK_TRAILER_GAIN_DISP", (-0.24, -0.15, 0.515), (0.042, 0.005, 0.018), mats["led_crimson"], bevel=0.001, parent=truck_workstation_group)
    make_box("TRUCK_BRAKE_SLIDER_L", (-0.252, -0.145, 0.492), (0.014, 0.012, 0.024), mats["aluminum_brushed"], bevel=0.002, parent=truck_workstation_group)
    make_box("TRUCK_BRAKE_SLIDER_R", (-0.228, -0.145, 0.492), (0.014, 0.012, 0.024), mats["aluminum_brushed"], bevel=0.002, parent=truck_workstation_group)

    # 3. FMVSS 121 Commercial Air Brake Push-Pull Diamond & Octagon Valves (Prominent Driver Right Wing)
    make_box("TRUCK_AIR_BRAKE_PANEL", (-0.24, -0.15, 0.58), (0.16, 0.045, 0.075), mats["charcoal_trim"], bevel=0.003, parent=truck_workstation_group)
    # Yellow Parking Brake Diamond (Pull to apply, push to release)
    make_cylinder("TRUCK_PARK_BRAKE_STEM", (-0.28, -0.13, 0.58), 0.006, 0.025, (math.radians(90), 0, 0), mats["chrome_mirror"], vertices=16, parent=truck_workstation_group)
    make_cylinder("TRUCK_PARK_BRAKE_KNOB", (-0.28, -0.10, 0.58), 0.018, 0.016, (math.radians(90), 0, math.radians(22.5)), mats["air_brake_yellow"], vertices=8, bevel=0.002, parent=truck_workstation_group)
    make_box("TRUCK_PARK_BRAKE_FACE", (-0.28, -0.091, 0.58), (0.014, 0.002, 0.014), mats["charcoal_trim"], rot_euler=(0, 0, math.radians(45)), bevel=0.001, parent=truck_workstation_group)
    # Red Trailer Air Supply Octagon (Pull to apply, push to supply)
    make_cylinder("TRUCK_TRAILER_AIR_STEM", (-0.20, -0.13, 0.58), 0.006, 0.025, (math.radians(90), 0, 0), mats["chrome_mirror"], vertices=16, parent=truck_workstation_group)
    make_cylinder("TRUCK_TRAILER_AIR_KNOB", (-0.20, -0.10, 0.58), 0.018, 0.016, (math.radians(90), 0, math.radians(22.5)), mats["air_brake_red"], vertices=8, bevel=0.002, parent=truck_workstation_group)
    make_cylinder("TRUCK_TRAILER_AIR_FACE", (-0.20, -0.091, 0.58), 0.010, 0.002, (math.radians(90), 0, 0), mats["charcoal_trim"], vertices=16, parent=truck_workstation_group)

    # 4. Auxiliary Heavy-Duty Roof / Dash Switchpod (6 High-Amp Rocker Switches with guards)
    make_box("TRUCK_AUX_SWITCHPOD", (0.0, -0.06, 0.62), (0.28, 0.065, 0.038), mats["charcoal_trim"], bevel=0.004, parent=truck_workstation_group)
    for sw_idx in range(6):
        sw_x = -0.10 + sw_idx * 0.040
        make_box(f"TRUCK_AUX_SW_{sw_idx+1}", (sw_x, -0.065, 0.62), (0.028, 0.030, 0.022), mats["piano_black"], bevel=0.002, parent=truck_workstation_group)
        make_box(f"TRUCK_AUX_LED_{sw_idx+1}", (sw_x, -0.078, 0.628), (0.018, 0.004, 0.004), mats["led_amber"], bevel=0.001, parent=truck_workstation_group)
        make_cylinder(f"TRUCK_AUX_GUARD_{sw_idx+1}", (sw_x, -0.072, 0.62), 0.002, 0.032, (0, 0, 0), mats["chrome_mirror"], vertices=12, parent=truck_workstation_group)

    # 5. Rugged CB Radio Transceiver & Fist Microphone
    make_box("TRUCK_CB_RADIO", (0.16, -0.26, 0.46), (0.12, 0.16, 0.048), mats["charcoal_trim"], bevel=0.003, parent=truck_workstation_group)
    make_box("TRUCK_CB_SCREEN", (0.16, -0.22, 0.47), (0.045, 0.005, 0.022), mats["led_amber"], bevel=0.001, parent=truck_workstation_group)
    make_cylinder("TRUCK_CB_DIAL_VOL", (0.125, -0.22, 0.47), 0.010, 0.012, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=16, parent=truck_workstation_group)
    make_cylinder("TRUCK_CB_DIAL_SQL", (0.195, -0.22, 0.47), 0.010, 0.012, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=16, parent=truck_workstation_group)
    make_box("TRUCK_CB_MIC", (0.23, -0.22, 0.51), (0.038, 0.026, 0.065), mats["charcoal_trim"], bevel=0.004, parent=truck_workstation_group)
    make_cylinder("TRUCK_CB_MIC_PTT", (0.248, -0.22, 0.51), 0.008, 0.022, (0, math.radians(90), 0), mats["rubber_traction"], vertices=16, parent=truck_workstation_group)

    # 6. Heavy-Duty Driver Commercial Air-Suspension Bellows Base & Folding Armrest
    for b_i in range(3):
        make_torus(f"TRUCK_DRIVER_BELLOW_{b_i+1}", (driver_x, -0.48, 0.08 + b_i * 0.042), major_radius=0.15, minor_radius=0.022, rot_euler=(0, 0, 0), mat=mats["rubber_traction"], parent=truck_workstation_group)
    make_box("TRUCK_DRIVER_SEAT_PEDESTAL", (driver_x, -0.48, 0.04), (0.34, 0.36, 0.04), mats["charcoal_trim"], bevel=0.004, parent=truck_workstation_group)
    make_box("TRUCK_DRIVER_SEAT_AIR_SW", (driver_x - 0.22, -0.46, 0.16), (0.012, 0.035, 0.022), mats["piano_black"], bevel=0.001, parent=truck_workstation_group)
    make_box("TRUCK_DRIVER_ARMREST", (driver_x + 0.22, -0.45, 0.46), (0.055, 0.32, 0.075), mats["leather_ebony"], bevel=0.010, parent=truck_workstation_group)
    make_cylinder("TRUCK_DRIVER_ARMREST_HINGE", (driver_x + 0.22, -0.58, 0.46), 0.018, 0.060, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=20, parent=truck_workstation_group)

    # 7. Heavy-Duty Steering Column Shifter with Tow/Haul Mode
    make_cylinder("TRUCK_COLUMN_SHIFTER_STALK", (driver_x + 0.12, 0.16, 0.64), 0.007, 0.16, (math.radians(-25), math.radians(35), 0), mats["chrome_mirror"], vertices=16, parent=truck_workstation_group)
    make_cylinder("TRUCK_COLUMN_SHIFTER_GRIP", (driver_x + 0.17, 0.11, 0.70), 0.016, 0.065, (math.radians(-25), math.radians(35), 0), mats["rubber_traction"], vertices=20, parent=truck_workstation_group)
    make_box("TRUCK_TOW_HAUL_BTN", (driver_x + 0.19, 0.09, 0.725), (0.010, 0.008, 0.010), mats["led_amber"], bevel=0.001, parent=truck_workstation_group)

    # 8. A-Pillar Assist Grab Handles (Left & Right)
    for side, sign in [("L", -1.0), ("R", 1.0)]:
        pillar_x = sign * 0.66
        make_box(f"TRUCK_A_PILLAR_GRAB_{side}", (pillar_x, -0.16, 0.88), (0.028, 0.040, 0.22), mats["rubber_traction"], bevel=0.008, parent=truck_workstation_group)
        make_cylinder(f"TRUCK_A_PILLAR_BOLT_TOP_{side}", (pillar_x, -0.15, 0.97), 0.008, 0.015, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=12, parent=truck_workstation_group)
        make_cylinder(f"TRUCK_A_PILLAR_BOLT_BTM_{side}", (pillar_x, -0.15, 0.79), 0.008, 0.015, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=12, parent=truck_workstation_group)

    # 9. Passenger Dash Heavy-Duty Assist Grab Handle
    make_box("TRUCK_DASH_GRAB_HANDLE", (pass_x, -0.10, 0.68), (0.24, 0.035, 0.048), mats["rubber_traction"], bevel=0.008, parent=truck_workstation_group)
    make_cylinder("TRUCK_GRAB_MOUNT_L", (pass_x - 0.10, -0.08, 0.68), 0.018, 0.035, (math.radians(90), 0, 0), mats["charcoal_trim"], vertices=20, parent=truck_workstation_group)
    make_cylinder("TRUCK_GRAB_MOUNT_R", (pass_x + 0.10, -0.08, 0.68), 0.018, 0.035, (math.radians(90), 0, 0), mats["charcoal_trim"], vertices=20, parent=truck_workstation_group)

    # 10. Overhead Sleeper Cab Storage Shelf & CB Speaker Console
    make_box("TRUCK_OVERHEAD_SHELF", (0.0, -0.22, 1.20), (1.08, 0.26, 0.085), mats["charcoal_trim"], bevel=0.008, parent=truck_workstation_group)
    make_box("TRUCK_SHELF_CUBBY_L", (-0.32, -0.22, 1.19), (0.34, 0.22, 0.055), mats["piano_black"], bevel=0.004, parent=truck_workstation_group)
    make_box("TRUCK_SHELF_CUBBY_R", (0.32, -0.22, 1.19), (0.34, 0.22, 0.055), mats["piano_black"], bevel=0.004, parent=truck_workstation_group)
    spk_cb = make_cylinder("TRUCK_OVERHEAD_CB_SPEAKER", (0.0, -0.20, 1.18), 0.048, 0.008, (math.radians(45), 0, 0), mats["speaker_acoustic"], vertices=24, parent=truck_workstation_group)
    unwrap_planar_uv(spk_cb)
    make_cylinder("TRUCK_MAP_LAMP_L", (-0.12, -0.16, 1.18), 0.016, 0.012, (math.radians(35), 0, 0), mats["ambient_cyan"], vertices=16, parent=truck_workstation_group)
    make_cylinder("TRUCK_MAP_LAMP_R", (0.12, -0.16, 1.18), 0.016, 0.012, (math.radians(35), 0, 0), mats["ambient_cyan"], vertices=16, parent=truck_workstation_group)

    # 11. All-Weather Deep-Dish Rubber Floor Mats with Chevron Traction Ridges
    for side, sign in [("L", -1.0), ("R", 1.0)]:
        fx = sign * 0.38
        make_box(f"TRUCK_FLOOR_MAT_{side}", (fx, 0.08, 0.04), (0.44, 0.52, 0.016), mats["rubber_traction"], bevel=0.004, parent=truck_workstation_group)
        for r_i in range(5):
            ry = -0.12 + r_i * 0.09
            make_box(f"TRUCK_MAT_RIDGE_{side}_{r_i+1}", (fx, ry, 0.05), (0.36, 0.022, 0.006), mats["charcoal_trim"], bevel=0.001, parent=truck_workstation_group)

    # 12. Workstation Armrest Fold-Flat Clipboard Deck & Oversized Insulated Cupholders
    make_box("TRUCK_CONSOLE_WORKSTATION_LID", (0.0, -0.48, 0.51), (0.34, 0.46, 0.030), mats["charcoal_trim"], bevel=0.006, parent=truck_workstation_group)
    make_box("TRUCK_CLIPBOARD_CLIP", (0.0, -0.32, 0.53), (0.12, 0.025, 0.012), mats["aluminum_brushed"], bevel=0.002, parent=truck_workstation_group)
    make_cylinder("TRUCK_CUPHOLDER_L", (-0.08, -0.20, 0.49), 0.046, 0.055, (0, 0, 0), mats["rubber_traction"], vertices=28, bevel=0.002, parent=truck_workstation_group)
    make_cylinder("TRUCK_CUPHOLDER_R", (0.08, -0.20, 0.49), 0.046, 0.055, (0, 0, 0), mats["rubber_traction"], vertices=28, bevel=0.002, parent=truck_workstation_group)

    # 13. Underseat Heavy-Duty Lockable Tool Vault (Beneath Row 2 Seat Bench)
    make_box("TRUCK_UNDERSEAT_STORAGE", (0.0, r2_y, r2_z - 0.075), (1.10, 0.44, 0.16), mats["charcoal_trim"], bevel=0.012, parent=truck_workstation_group)
    make_box("TRUCK_STORAGE_LID", (0.0, r2_y, r2_z + 0.01), (1.08, 0.42, 0.018), mats["aluminum_brushed"], bevel=0.004, parent=truck_workstation_group)
    make_box("TRUCK_STORAGE_LATCH_L", (-0.32, r2_y + 0.22, r2_z + 0.005), (0.045, 0.018, 0.025), mats["chrome_mirror"], bevel=0.002, parent=truck_workstation_group)
    make_box("TRUCK_STORAGE_LATCH_R", (0.32, r2_y + 0.22, r2_z + 0.005), (0.045, 0.018, 0.025), mats["chrome_mirror"], bevel=0.002, parent=truck_workstation_group)

    # ------------------------------------------------------------------------
    # 9.G. TRANSIT BUS & HIGH-CAPACITY SHUTTLE (Farebox, Stanchions, Barrier, Controls)
    # ------------------------------------------------------------------------
    log("9.G Modeling TRANSIT BUS & SHUTTLE (Fare Validator, Safety Stanchions, Bus Wheel, Door Controls)...")
    bus_transit_group = bpy.data.objects.new("BUS_TRANSIT_CABIN", None)
    bpy.context.scene.collection.objects.link(bus_transit_group)
    attach_to_parent(bus_transit_group, cockpit_master)

    # 1. Authentic Transit Bus Steering Assembly (480mm Flat Angled Wheel & Retarder Lever)
    bus_steer_group = bpy.data.objects.new("BUS_STEERING_ASSEMBLY", None)
    bpy.context.scene.collection.objects.link(bus_steer_group)
    attach_to_parent(bus_steer_group, bus_transit_group)

    steer_tilt = (math.radians(-38), 0, 0)
    make_cylinder("BUS_TRANSIT_COLUMN", (driver_x, 0.22, 0.48), 0.052, 0.62, steer_tilt, mats["charcoal_trim"], vertices=24, bevel=0.003, parent=bus_steer_group)
    make_torus("BUS_TRANSIT_WHEEL_RIM", (driver_x, 0.08, 0.68), major_radius=0.235, minor_radius=0.018, rot_euler=steer_tilt, mat=mats["rubber_traction"], major_segments=48, minor_segments=24, parent=bus_steer_group)
    make_box("BUS_TRANSIT_HORN_HUB", (driver_x, 0.08, 0.68), (0.13, 0.11, 0.038), mats["charcoal_trim"], rot_euler=steer_tilt, bevel=0.006, parent=bus_steer_group)
    make_box("BUS_TRANSIT_SPOKE_BAR", (driver_x, 0.08, 0.68), (0.45, 0.040, 0.016), mats["charcoal_trim"], rot_euler=steer_tilt, bevel=0.003, parent=bus_steer_group)
    make_cylinder("BUS_RETARDER_STALK", (driver_x + 0.11, 0.16, 0.58), 0.006, 0.14, (math.radians(-25), math.radians(45), 0), mats["chrome_mirror"], vertices=16, parent=bus_steer_group)
    make_cylinder("BUS_RETARDER_KNOB", (driver_x + 0.16, 0.11, 0.64), 0.015, 0.040, (math.radians(-25), math.radians(45), 0), mats["rubber_traction"], vertices=20, parent=bus_steer_group)

    # 2. Contactless Smartcard / Fare Validator Terminal Pedestal
    make_box("BUS_FAREBOX", (0.24, 0.08, 0.46), (0.22, 0.22, 0.65), mats["charcoal_trim"], bevel=0.008, parent=bus_transit_group)
    make_box("INTERIOR_FareBox_Smartcard_Terminal", (0.24, 0.08, 0.46), (0.22, 0.22, 0.65), mats["charcoal_trim"], bevel=0.008, parent=bus_transit_group)
    make_cylinder("BUS_FARE_TAP_TARGET", (0.24, 0.04, 0.74), 0.055, 0.008, (math.radians(90), 0, 0), mats["led_emerald"], vertices=32, parent=bus_transit_group)
    make_box("BUS_FARE_SCREEN", (0.24, 0.05, 0.81), (0.14, 0.010, 0.06), mats["screen_infotainment"], bevel=0.002, parent=bus_transit_group)
    make_box("BUS_COIN_SLOT", (0.24, 0.08, 0.77), (0.045, 0.006, 0.012), mats["aluminum_brushed"], bevel=0.001, parent=bus_transit_group)
    make_box("BUS_TICKET_DISPENSER", (0.24, 0.02, 0.68), (0.10, 0.012, 0.035), mats["aluminum_brushed"], bevel=0.002, parent=bus_transit_group)
    make_box("BUS_TICKET_PAPER_SLOT", (0.24, 0.012, 0.68), (0.075, 0.002, 0.004), mats["piano_black"], bevel=0, parent=bus_transit_group)

    # 3. Commercial Driver Air-Suspension Bellows Base & Dual Armrests
    for b_i in range(3):
        make_torus(f"BUS_DRIVER_BELLOW_{b_i+1}", (driver_x, -0.48, 0.08 + b_i * 0.042), major_radius=0.15, minor_radius=0.022, rot_euler=(0, 0, 0), mat=mats["rubber_traction"], parent=bus_transit_group)
    make_box("BUS_DRIVER_ARMREST_L", (driver_x - 0.22, -0.45, 0.46), (0.055, 0.32, 0.075), mats["charcoal_trim"], bevel=0.010, parent=bus_transit_group)
    make_box("BUS_DRIVER_ARMREST_R", (driver_x + 0.22, -0.45, 0.46), (0.055, 0.32, 0.075), mats["charcoal_trim"], bevel=0.010, parent=bus_transit_group)

    # 4. Driver Door & Secondary Controls Switchboard Console (Left of Driver)
    make_box("BUS_DRIVER_DOOR_CONSOLE", (driver_x - 0.28, -0.05, 0.54), (0.16, 0.32, 0.14), mats["charcoal_trim"], bevel=0.006, parent=bus_transit_group)
    make_cylinder("BUS_DOOR_LEVER_FRONT", (driver_x - 0.26, -0.12, 0.63), 0.006, 0.055, (math.radians(15), 0, 0), mats["aluminum_brushed"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_DOOR_KNOB_FRONT", (driver_x - 0.26, -0.13, 0.66), 0.012, 0.022, (math.radians(15), 0, 0), mats["safety_yellow"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_DOOR_LEVER_REAR", (driver_x - 0.22, -0.12, 0.63), 0.006, 0.055, (math.radians(15), 0, 0), mats["aluminum_brushed"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_DOOR_KNOB_REAR", (driver_x - 0.22, -0.13, 0.66), 0.012, 0.022, (math.radians(15), 0, 0), mats["led_crimson"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_EMERGENCY_STOP_BASE", (driver_x - 0.30, 0.04, 0.62), 0.018, 0.010, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=bus_transit_group)
    make_cylinder("BUS_EMERGENCY_STOP_MUSHROOM", (driver_x - 0.30, 0.04, 0.635), 0.022, 0.018, (0, 0, 0), mats["led_crimson"], vertices=24, parent=bus_transit_group)
    make_box("BUS_ROUTE_KEYPAD", (driver_x - 0.25, 0.06, 0.62), (0.055, 0.075, 0.012), mats["piano_black"], bevel=0.002, parent=bus_transit_group)
    make_cylinder("BUS_PA_MIC_BASE", (driver_x - 0.32, -0.18, 0.62), 0.012, 0.015, (0, 0, 0), mats["charcoal_trim"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_PA_MIC_STALK", (driver_x - 0.31, -0.14, 0.74), 0.004, 0.25, (math.radians(-20), math.radians(15), 0), mats["aluminum_brushed"], vertices=12, parent=bus_transit_group)
    make_cylinder("BUS_PA_MIC_CAPSULE", (driver_x - 0.30, -0.09, 0.86), 0.010, 0.035, (math.radians(-20), math.radians(15), 0), mats["rubber_traction"], vertices=16, parent=bus_transit_group)

    # 5. Transparent Curved Driver Protective Partition Barrier
    make_box("BUS_DRIVER_BARRIER", (driver_x, -0.65, 0.78), (0.68, 0.012, 0.92), mats["glass_optical"], bevel=0.004, parent=bus_transit_group)
    make_cylinder("BUS_BARRIER_FRAME_L", (driver_x - 0.34, -0.65, 0.78), 0.014, 0.92, (0, 0, 0), mats["charcoal_trim"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_BARRIER_FRAME_R", (driver_x + 0.34, -0.65, 0.78), 0.014, 0.92, (0, 0, 0), mats["charcoal_trim"], vertices=16, parent=bus_transit_group)
    make_cylinder("BUS_BARRIER_HEADER", (driver_x, -0.65, 1.24), 0.014, 0.68, (0, math.radians(90), 0), mats["charcoal_trim"], vertices=16, parent=bus_transit_group)

    # 6. Passenger Entrance Modesty Barrier & Boarding Stanchion (Vestibule Area)
    make_box("BUS_ENTRY_MODESTY_PANEL", (0.56, -0.62, 0.70), (0.44, 0.014, 0.86), mats["frosted_chiller_glass"], bevel=0.004, parent=bus_transit_group)
    make_cylinder("BUS_ENTRY_MODESTY_FRAME_L", (0.34, -0.62, 0.70), 0.016, 0.88, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=bus_transit_group)
    make_cylinder("BUS_ENTRY_MODESTY_FRAME_R", (0.78, -0.62, 0.70), 0.016, 0.88, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=bus_transit_group)
    make_cylinder("BUS_ENTRY_MODESTY_TOP", (0.56, -0.62, 1.14), 0.016, 0.44, (0, math.radians(90), 0), mats["safety_yellow"], vertices=20, parent=bus_transit_group)
    make_cylinder("BUS_BOARDING_HANDRAIL", (0.34, -0.18, 0.68), 0.018, 0.96, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=bus_transit_group)
    make_box("BUS_STEP_LIGHT", (0.56, 0.08, 0.06), (0.18, 0.04, 0.015), mats["ambient_cyan"], bevel=0.001, parent=bus_transit_group)

    # 7. Overhead Central LED Destination Route / Stop Sign
    make_box("BUS_CABIN_DESTINATION_SIGN", (0.0, -0.55, 1.22), (0.64, 0.05, 0.12), mats["charcoal_trim"], bevel=0.004, parent=bus_transit_group)
    make_box("BUS_SIGN_LED_TEXT", (0.0, -0.575, 1.22), (0.58, 0.004, 0.08), mats["led_amber"], bevel=0.001, parent=bus_transit_group)
    make_box("BUS_STOP_REQUESTED_LAMP", (0.0, -0.525, 1.22), (0.58, 0.004, 0.08), mats["led_crimson"], bevel=0.001, parent=bus_transit_group)

    # 8. High-Visibility Safety Yellow Stanchion Grab Poles
    stanchion_group = bpy.data.objects.new("BUS_STANCHIONS", None)
    bpy.context.scene.collection.objects.link(stanchion_group)
    attach_to_parent(stanchion_group, bus_transit_group)

    pole_z = 0.72
    pole_h = 1.28
    make_cylinder("BUS_STANCHION_POLE_L", (-0.25, -0.85, pole_z), 0.018, pole_h, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)
    make_cylinder("BUS_STANCHION_POLE_R", (0.25, -0.85, pole_z), 0.018, pole_h, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)
    make_cylinder("INTERIOR_Stanchion_Poles", (0.25, -0.85, pole_z), 0.018, pole_h, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)
    make_cylinder("BUS_STANCHION_CROSSBAR", (0.0, -0.85, pole_z + pole_h * 0.48), 0.016, 0.50, (0, math.radians(90), 0), mats["safety_yellow"], vertices=20, parent=stanchion_group)

    # Stanchion "STOP REQUEST" Bell Push Buttons
    make_cylinder("BUS_STOP_BTN_1", (-0.25, -0.83, 0.92), 0.012, 0.024, (math.radians(90), 0, 0), mats["led_crimson"], vertices=16, parent=stanchion_group)
    make_cylinder("BUS_STOP_BTN_2", (0.25, -0.83, 0.92), 0.012, 0.024, (math.radians(90), 0, 0), mats["led_crimson"], vertices=16, parent=stanchion_group)

    # 9. Horizontal Overhead Grab Rails & Hanging Commuter Straps
    rail_len = 2.40
    make_cylinder("BUS_OVERHEAD_RAIL_L", (-0.25, -1.25, 1.28), 0.016, rail_len, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)
    make_cylinder("BUS_OVERHEAD_RAIL_R", (0.25, -1.25, 1.28), 0.016, rail_len, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)

    # Hanging Straps along overhead rail
    for st_i, st_y in enumerate([-0.65, -1.05, -1.45, -1.85]):
        make_box(f"BUS_GRAB_STRAP_{st_i+1}", (-0.25, st_y, 1.20), (0.024, 0.006, 0.14), mats["rubber_traction"], bevel=0, parent=stanchion_group)
        make_cylinder(f"BUS_GRAB_RING_{st_i+1}", (-0.25, st_y, 1.11), 0.038, 0.012, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)
        make_box(f"BUS_GRAB_STRAP_R_{st_i+1}", (0.25, st_y, 1.20), (0.024, 0.006, 0.14), mats["rubber_traction"], bevel=0, parent=stanchion_group)
        make_cylinder(f"BUS_GRAB_RING_R_{st_i+1}", (0.25, st_y, 1.11), 0.038, 0.012, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_group)

    # 10. Rows of Cantilevered High-Impact Vandal-Proof Transit Passenger Seats
    bus_seats_group = bpy.data.objects.new("BUS_PASSENGER_SEATS", None)
    bpy.context.scene.collection.objects.link(bus_seats_group)
    attach_to_parent(bus_seats_group, bus_transit_group)

    for row_idx, ry in enumerate([-1.15, -1.75, -2.35]):
        for side, sign in [("L", -1.0), ("R", 1.0)]:
            sx = sign * 0.56
            make_box(f"BUS_SEAT_SHELL_R{row_idx+1}_{side}", (sx, ry, 0.42), (0.42, 0.38, 0.030), mats["transit_plastic_blue"], bevel=0.008, parent=bus_seats_group)
            make_box(f"BUS_SEAT_BACK_R{row_idx+1}_{side}", (sx, ry - 0.16, 0.65), (0.40, 0.030, 0.44), mats["transit_plastic_blue"], bevel=0.008, parent=bus_seats_group)
            make_box(f"BUS_SEAT_PAD_CUSH_R{row_idx+1}_{side}", (sx, ry, 0.44), (0.34, 0.32, 0.018), mats["transit_fabric"], bevel=0.004, parent=bus_seats_group)
            make_box(f"BUS_SEAT_PAD_BACK_R{row_idx+1}_{side}", (sx, ry - 0.15, 0.65), (0.32, 0.016, 0.36), mats["transit_fabric"], bevel=0.004, parent=bus_seats_group)
            make_cylinder(f"BUS_SEAT_HANDLE_R{row_idx+1}_{side}", (sx + sign * 0.15, ry - 0.16, 0.88), 0.010, 0.12, (0, math.radians(90), 0), mats["safety_yellow"], vertices=16, parent=bus_seats_group)

    # 11. Commercial Driver Overhead Pull-Down Sunblind / Roller Visor
    make_cylinder("BUS_DRIVER_SUNBLIND_CASING", (driver_x, 0.04, 1.25), 0.012, 0.58, (0, math.radians(90), 0), mats["aluminum_brushed"], vertices=20, parent=bus_transit_group)
    make_box("BUS_DRIVER_SUNBLIND_FABRIC", (driver_x, 0.05, 1.15), (0.54, 0.002, 0.20), mats["charcoal_trim"], bevel=0.001, parent=bus_transit_group)
    make_cylinder("BUS_DRIVER_SUNBLIND_PULL", (driver_x, 0.052, 1.05), 0.005, 0.045, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=12, parent=bus_transit_group)

    # ------------------------------------------------------------------------
    # 9.H. SUPERCAR & TRACK SPECIAL COCKPIT (Carbon Tub, FIA Roll Cage, 6-Pt Harness)
    # ------------------------------------------------------------------------
    log("9.H Modeling SUPERCAR & TRACK SPECIAL COCKPIT (Carbon Sills, FIA Roll Cage, Fire Extinguisher, 6-Pt Harness)...")
    supercar_track_group = bpy.data.objects.new("SUPERCAR_TRACK_CABIN", None)
    bpy.context.scene.collection.objects.link(supercar_track_group)
    attach_to_parent(supercar_track_group, cockpit_master)

    # 1. Structural Carbon Fiber Monocoque Sills & Footrest
    make_box("CARBON_TUB_SILL_L", (-0.68, -0.35, 0.26), (0.24, 1.20, 0.26), mats["carbon_twill"], bevel=0.012, parent=supercar_track_group)
    make_box("CARBON_TUB_SILL_R", (0.68, -0.35, 0.26), (0.24, 1.20, 0.26), mats["carbon_twill"], bevel=0.012, parent=supercar_track_group)
    make_box("CARBON_TUB_STEP_PLATE_L", (-0.68, -0.35, 0.392), (0.16, 0.80, 0.005), mats["aluminum_brushed"], bevel=0.002, parent=supercar_track_group)
    make_box("CARBON_TUB_STEP_PLATE_R", (0.68, -0.35, 0.392), (0.16, 0.80, 0.005), mats["aluminum_brushed"], bevel=0.002, parent=supercar_track_group)
    make_box("CO_DRIVER_FOOTREST", (pass_x, 0.20, 0.16), (0.32, 0.24, 0.016), mats["aluminum_brushed"], rot_euler=(math.radians(38), 0, 0), bevel=0.003, parent=supercar_track_group)
    for ft_i in range(4):
        make_box(f"FOOTREST_GRIP_SLOT_{ft_i+1}", (pass_x, 0.14 + ft_i * 0.045, 0.12 + ft_i * 0.035), (0.24, 0.015, 0.004), mats["rubber_traction"], rot_euler=(math.radians(38), 0, 0), parent=supercar_track_group)

    # 2. FIA Homologated T45 Roll Cage Assembly
    rollcage_group = bpy.data.objects.new("ROLLCAGE_ASSEMBLY", None)
    bpy.context.scene.collection.objects.link(rollcage_group)
    attach_to_parent(rollcage_group, supercar_track_group)

    # Main B-Pillar Hoop
    make_cylinder("ROLLCAGE_MAIN_L", (-0.62, -0.92, 0.68), 0.024, 0.98, (0, 0, 0), mats["rollcage_satin"], vertices=24, parent=rollcage_group)
    make_cylinder("ROLLCAGE_MAIN_R", (0.62, -0.92, 0.68), 0.024, 0.98, (0, 0, 0), mats["rollcage_satin"], vertices=24, parent=rollcage_group)
    make_cylinder("ROLLCAGE_MAIN_TOP", (0.0, -0.92, 1.18), 0.024, 1.24, (0, math.radians(90), 0), mats["rollcage_satin"], vertices=24, parent=rollcage_group)

    # Door Intrusion X-Braces (Left & Right)
    make_cylinder("ROLLCAGE_DOOR_X_L1", (-0.64, -0.38, 0.44), 0.020, 1.15, (math.radians(-28), 0, 0), mats["rollcage_satin"], vertices=16, parent=rollcage_group)
    make_cylinder("ROLLCAGE_DOOR_X_L2", (-0.64, -0.38, 0.44), 0.020, 1.15, (math.radians(28), 0, 0), mats["rollcage_satin"], vertices=16, parent=rollcage_group)
    make_cylinder("ROLLCAGE_DOOR_X_R1", (0.64, -0.38, 0.44), 0.020, 1.15, (math.radians(-28), 0, 0), mats["rollcage_satin"], vertices=16, parent=rollcage_group)
    make_cylinder("ROLLCAGE_DOOR_X_R2", (0.64, -0.38, 0.44), 0.020, 1.15, (math.radians(28), 0, 0), mats["rollcage_satin"], vertices=16, parent=rollcage_group)

    # 3. Plumbed-In Lifeline / OMP Fire Suppression System
    make_cylinder("RACE_FIRE_BOTTLE", (0.0, -0.72, 0.22), 0.065, 0.38, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=28, parent=supercar_track_group)
    make_cylinder("RACE_FIRE_TRIGGER_HEAD", (0.0, -0.52, 0.22), 0.022, 0.045, (math.radians(90), 0, 0), mats["anodized_red"], vertices=20, parent=supercar_track_group)
    make_cylinder("RACE_FIRE_GAUGE", (0.025, -0.52, 0.24), 0.014, 0.012, (0, math.radians(90), 0), mats["hud_cyan"], vertices=16, parent=supercar_track_group)
    make_torus("RACE_FIRE_CLAMP_1", (0.0, -0.64, 0.22), major_radius=0.068, minor_radius=0.005, rot_euler=(math.radians(90), 0, 0), mat=mats["titanium_matte"], parent=supercar_track_group)
    make_torus("RACE_FIRE_CLAMP_2", (0.0, -0.80, 0.22), major_radius=0.068, minor_radius=0.005, rot_euler=(math.radians(90), 0, 0), mat=mats["titanium_matte"], parent=supercar_track_group)

    # Cockpit Emergency Pulls & Battery Kill Switch
    make_cylinder("RACE_FIRE_PULL_STEM", (-0.06, -0.26, 0.52), 0.005, 0.035, (0, 0, 0), mats["aluminum_brushed"], vertices=12, parent=supercar_track_group)
    make_box("RACE_FIRE_PULL_HANDLE", (-0.06, -0.26, 0.542), (0.045, 0.016, 0.014), mats["anodized_red"], bevel=0.002, parent=supercar_track_group)
    make_box("RACE_FIRE_LABEL", (-0.06, -0.23, 0.525), (0.038, 0.002, 0.014), mats["safety_yellow"], parent=supercar_track_group)

    make_cylinder("RACE_BATTERY_ISOLATOR_BASE", (0.06, -0.26, 0.52), 0.018, 0.014, (0, 0, 0), mats["charcoal_trim"], vertices=20, parent=supercar_track_group)
    make_box("RACE_BATTERY_KEY", (0.06, -0.26, 0.536), (0.026, 0.008, 0.024), mats["anodized_red"], rot_euler=(0, 0, math.radians(25)), bevel=0.002, parent=supercar_track_group)
    make_box("RACE_BATTERY_LABEL", (0.06, -0.23, 0.525), (0.030, 0.002, 0.014), mats["safety_yellow"], parent=supercar_track_group)

    # 4. Motorsport Cockpit Brake Proportioning Balance & Aircraft Toggles
    make_cylinder("RACE_BRAKE_BIAS_BEZEL", (-0.06, -0.34, 0.515), 0.022, 0.008, (0, 0, 0), mats["charcoal_trim"], vertices=24, parent=supercar_track_group)
    make_cylinder("RACE_BRAKE_BIAS_KNOB", (-0.06, -0.34, 0.526), 0.016, 0.016, (0, 0, 0), mats["aluminum_brushed"], vertices=32, parent=supercar_track_group)
    make_box("RACE_BRAKE_BIAS_DISP", (-0.06, -0.31, 0.518), (0.036, 0.004, 0.014), mats["hud_cyan"], bevel=0.001, parent=supercar_track_group)

    make_box("RACE_LAUNCH_SWITCH_BASE", (0.06, -0.34, 0.515), (0.024, 0.030, 0.010), mats["charcoal_trim"], bevel=0.002, parent=supercar_track_group)
    make_box("RACE_LAUNCH_FLIP_GUARD", (0.06, -0.34, 0.528), (0.018, 0.026, 0.018), mats["anodized_red"], bevel=0.002, parent=supercar_track_group)
    make_cylinder("RACE_PIT_LIMITER_BEZEL", (0.06, -0.39, 0.51), 0.014, 0.006, (0, 0, 0), mats["charcoal_trim"], vertices=20, parent=supercar_track_group)
    make_cylinder("RACE_PIT_LIMITER_BTN", (0.06, -0.39, 0.518), 0.010, 0.010, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=supercar_track_group)

    # 5. 6-Point Competition Sabelt/Willans Racing Harness (Driver & Passenger)
    for side, sx in [("DRIVER", driver_x), ("PASS", pass_x)]:
        # Shoulder Straps (wrapping over harness bar at z=0.58, down through seat headrest pass-through)
        make_box(f"HARNESS_SHOULDER_{side}_L", (sx - 0.065, -0.66, 0.62), (0.065, 0.004, 0.52), mats["racing_harness_red"], rot_euler=(math.radians(24), 0, 0), parent=supercar_track_group)
        make_box(f"HARNESS_SHOULDER_{side}_R", (sx + 0.065, -0.66, 0.62), (0.065, 0.004, 0.52), mats["racing_harness_red"], rot_euler=(math.radians(24), 0, 0), parent=supercar_track_group)
        # Lap Belts (from chassis side eyelets)
        make_box(f"HARNESS_LAP_{side}_L", (sx - 0.18, -0.44, 0.30), (0.065, 0.004, 0.28), mats["racing_harness_red"], rot_euler=(math.radians(-32), math.radians(-35), 0), parent=supercar_track_group)
        make_box(f"HARNESS_LAP_{side}_R", (sx + 0.18, -0.44, 0.30), (0.065, 0.004, 0.28), mats["racing_harness_red"], rot_euler=(math.radians(-32), math.radians(35), 0), parent=supercar_track_group)
        # Anti-Submarine Crotch Belts
        make_box(f"HARNESS_SUB_{side}_1", (sx - 0.035, -0.42, 0.26), (0.035, 0.004, 0.16), mats["racing_harness_red"], rot_euler=(math.radians(55), 0, 0), parent=supercar_track_group)
        make_box(f"HARNESS_SUB_{side}_2", (sx + 0.035, -0.42, 0.26), (0.035, 0.004, 0.16), mats["racing_harness_red"], rot_euler=(math.radians(55), 0, 0), parent=supercar_track_group)
        # Central Rotary Quick-Release Camlock Buckle
        make_cylinder(f"HARNESS_CAMLOCK_{side}", (sx, -0.40, 0.32), 0.032, 0.018, (math.radians(65), 0, 0), mats["anodized_red"], vertices=32, parent=supercar_track_group)
        make_cylinder(f"HARNESS_CAMLOCK_RELEASE_{side}", (sx, -0.395, 0.32), 0.016, 0.024, (math.radians(65), 0, 0), mats["aluminum_brushed"], vertices=24, parent=supercar_track_group)

    # 6. RPM Shift-Light LED Ladder Array (Top of Column)
    make_box("RACE_SHIFT_LIGHT_BAR", (driver_x, 0.02, 0.74), (0.24, 0.024, 0.018), mats["carbon_twill"], bevel=0.003, parent=supercar_track_group)
    for g_i in range(4):
        make_box(f"RACE_SHIFT_LED_G{g_i+1}", (driver_x - 0.09 + g_i * 0.016, 0.031, 0.74), (0.010, 0.003, 0.010), mats["shift_light_green"], bevel=0.001, parent=supercar_track_group)
    for a_i in range(4):
        make_box(f"RACE_SHIFT_LED_A{a_i+1}", (driver_x - 0.026 + a_i * 0.016, 0.031, 0.74), (0.010, 0.003, 0.010), mats["shift_light_amber"], bevel=0.001, parent=supercar_track_group)
    for r_i in range(4):
        make_box(f"RACE_SHIFT_LED_R{r_i+1}", (driver_x + 0.038 + r_i * 0.016, 0.031, 0.74), (0.010, 0.003, 0.010), mats["gauge_needle_red"], bevel=0.001, parent=supercar_track_group)
    for b_i in range(3):
        make_box(f"RACE_SHIFT_LED_FLASH{b_i+1}", (driver_x - 0.016 + b_i * 0.016, 0.031, 0.752), (0.012, 0.003, 0.006), mats["shift_light_blue"], bevel=0.001, parent=supercar_track_group)

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
    # EXPORT MASTER & DEDICATED INDIVIDUAL INTERIOR GLBS
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

    # 1. Export Dedicated Luxury Sedan / Limousine Cockpit (cockpit_executive_lwb.glb)
    export_dedicated_cockpit(
        out_path=os.path.join(out_dir, "cockpit_executive_lwb.glb"),
        include_names={"LUXURY_REAR_LOUNGE"},
        exclude_names={"TRUCK_WORKSTATION", "BUS_TRANSIT_CABIN", "SUPERCAR_TRACK_CABIN"},
        shift_nodes={"SEATS_ROW2": Vector((0, -0.28, 0)), "REAR_AMENITIES": Vector((0, -0.28, 0))}
    )

    # 2. Export Dedicated Heavy-Duty Truck Cockpit (cockpit_heavy_duty_truck.glb)
    export_dedicated_cockpit(
        out_path=os.path.join(out_dir, "cockpit_heavy_duty_truck.glb"),
        include_names={"TRUCK_WORKSTATION"},
        exclude_names={
            "SEATS_ROW3",
            "REAR_AMENITIES",
            "LUXURY_REAR_LOUNGE",
            "BUS_TRANSIT_CABIN",
            "SUPERCAR_TRACK_CABIN",
            "STEERING_GT3_YOKE",
            "STEERING_FORMULA_YOKE",
            "STEERING_SPORT_3SPOKE",
            "STEERING_GT_3SPOKE",
            "PADDLE_SHIFTER_L",
            "PADDLE_SHIFTER_R",
            "SHIFTER_ELECTRONIC_MONOSTABLE",
            "SHIFTER_GATED_MANUAL",
            "SHIFTER_ROTARY_DIAL",
            "SHIFTER_TRACK_SEQUENTIAL",
            "CONSOLE_SHIFTER_AUTO",
            "CONSOLE_SHIFTER_CRYSTAL",
            "CONSOLE_SHIFTER_MANUAL_GATED",
            "CONSOLE_SHIFTER_MANUAL_H",
            "CONSOLE_SHIFTER_PERFORMANCE",
            "CONSOLE_SHIFTER_ROTARY",
            "CONSOLE_SHIFTER_TOGGLE",
        }
    )

    # 3. Export Dedicated Transit Bus Cockpit (cockpit_transit_bus.glb)
    export_dedicated_cockpit(
        out_path=os.path.join(out_dir, "cockpit_transit_bus.glb"),
        include_names={"BUS_TRANSIT_CABIN"},
        exclude_names={
            "SEAT_UNIT_PASS",
            "SEATS_ROW2",
            "SEATS_ROW3",
            "REAR_AMENITIES",
            "SEATBELT_STRAP_PASS",
            "DOOR_CARD_R_Mesh",
            "DOOR_ARMREST_R",
            "DOOR_SPEAKER_R",
            "DOOR_SPK_CHROME_R",
            "DOOR_TRIM_SPEAR_R",
            "DOOR_AMBIENT_R",
            "LUXURY_REAR_LOUNGE",
            "TRUCK_WORKSTATION",
            "SUPERCAR_TRACK_CABIN",
            "STEERING_SPORT_3SPOKE",
            "STEERING_GT_3SPOKE",
            "STEERING_GT3_YOKE",
            "STEERING_FORMULA_YOKE",
            "STEERING_LUXURY_2SPOKE",
            "STEERING_CLASSIC_4SPOKE",
            "STEERING_PERFORMANCE_4SPOKE",
            "PADDLE_SHIFTER_L",
            "PADDLE_SHIFTER_R",
            "SHIFTER_ELECTRONIC_MONOSTABLE",
            "SHIFTER_GATED_MANUAL",
            "SHIFTER_ROTARY_DIAL",
            "SHIFTER_TRACK_SEQUENTIAL",
            "CONSOLE_SHIFTER_AUTO",
            "CONSOLE_SHIFTER_CRYSTAL",
            "CONSOLE_SHIFTER_MANUAL_GATED",
            "CONSOLE_SHIFTER_MANUAL_H",
            "CONSOLE_SHIFTER_PERFORMANCE",
            "CONSOLE_SHIFTER_ROTARY",
            "CONSOLE_SHIFTER_TOGGLE",
        }
    )

    # 4. Export Dedicated Supercar & Track Special Cockpit (cockpit_supercar_track.glb)
    export_dedicated_cockpit(
        out_path=os.path.join(out_dir, "cockpit_supercar_track.glb"),
        include_names={"SUPERCAR_TRACK_CABIN"},
        exclude_names={
            "SEATS_ROW2",
            "SEATS_ROW3",
            "REAR_AMENITIES",
            "LUXURY_REAR_LOUNGE",
            "TRUCK_WORKSTATION",
            "BUS_TRANSIT_CABIN",
            "STEERING_LUXURY_2SPOKE",
            "STEERING_CLASSIC_4SPOKE",
            "STEERING_PERFORMANCE_4SPOKE",
            "SHIFTER_ROTARY_DIAL",
            "CONSOLE_SHIFTER_ROTARY",
            "CONSOLE_SHIFTER_AUTO",
            "CONSOLE_SHIFTER_CRYSTAL",
            "CONSOLE_CUPHOLDER_L",
            "CONSOLE_CUPHOLDER_R",
        }
    )

def export_dedicated_cockpit(out_path, include_names, exclude_names, shift_nodes=None):
    """Helper to selectively export dedicated standalone cockpit variants."""
    log(f"Exporting standalone cockpit variant: {os.path.basename(out_path)}")
    shifted = []
    if shift_nodes:
        for node_name, delta in shift_nodes.items():
            obj = bpy.data.objects.get(node_name)
            if obj:
                obj.location += delta
                shifted.append((obj, delta))

    # Temporarily hide excluded branches
    hidden_objs = []
    for exc in exclude_names:
        obj = bpy.data.objects.get(exc)
        if obj and not obj.hide_get():
            obj.hide_set(True)
            hidden_objs.append(obj)

    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='SELECT')
    # Deselect excluded
    for h in hidden_objs:
        h.select_set(False)
        for child in h.children_recursive:
            child.select_set(False)

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='AUTO',
    )
    sz = os.path.getsize(out_path) / 1024.0
    log(f"[SUCCESS] Exported {os.path.basename(out_path)} ({sz:.1f} KB)")

    # Restore visibility & positions
    for h in hidden_objs:
        h.hide_set(False)
    for obj, delta in shifted:
        obj.location -= delta
    bpy.context.view_layer.update()

if __name__ == "__main__":
    build_class_a_interactive_dashboard()
