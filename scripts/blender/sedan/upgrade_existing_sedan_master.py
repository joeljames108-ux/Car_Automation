"""
==============================================================================
AUTOMOTIVE MASTER PIPELINE: UPGRADE EXISTING HIGH-POLY CAD SEDAN MODEL
==============================================================================
Loads the authentic 400k-poly CAD base model, cleans split normals, applies
weighted normal modifiers, high-end PBR multi-layer shaders, textured tires &
wheels, glass dielectric optical shaders, OLED lighting, calibrated stance,
and exports unified complete sedan and modular subassemblies.
==============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
from mathutils import Vector, Matrix

def log(msg):
    print(f"[SEDAN_UPGRADE] {msg}")

PROJECT_DIR = r"E:\Car_Automation"
TEX_DIR = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

# Output Dirs
PUBLIC_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
PUBLIC_VEHICLES_SEDAN_DIR = os.path.join(PROJECT_DIR, "public", "vehicles", "sedan")
PUBLIC_MODELS_SEDAN_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicles", "sedan")
PUBLIC_FAMILIES_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicle_families")
PUBLIC_FAMILIES_COMPONENTS_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "components")
PUBLIC_FAMILIES_COMPLETE_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "complete")
PUBLIC_MODULAR_DIR = os.path.join(PUBLIC_MODELS_DIR, "modular_parts", "individual")
PUBLIC_MODULAR_BASE = os.path.join(PUBLIC_MODELS_DIR, "modular_parts")
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
EXPORTS_PARTS_DIR = os.path.join(EXPORTS_DIR, "parts")

for d in [
    PUBLIC_MODELS_DIR, PUBLIC_VEHICLES_SEDAN_DIR, PUBLIC_MODELS_SEDAN_DIR,
    PUBLIC_FAMILIES_DIR, PUBLIC_FAMILIES_COMPONENTS_DIR, PUBLIC_FAMILIES_COMPLETE_DIR,
    PUBLIC_MODULAR_DIR, PUBLIC_MODULAR_BASE, EXPORTS_DIR, EXPORTS_PARTS_DIR
]:
    os.makedirs(d, exist_ok=True)

def safe_copy(src, dst):
    """Safely copy files even if watched by dev servers."""
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst):
            try:
                os.remove(dst)
            except Exception:
                pass
        shutil.copyfile(src, dst)
    except Exception:
        try:
            with open(src, 'rb') as f_in:
                data = f_in.read()
            with open(dst, 'wb') as f_out:
                f_out.write(data)
        except Exception as e2:
            print(f"Warning writing to {dst}: {e2}")

# ----------------------------------------------------------------------------
# 1. PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def set_socket(bsdf, names, val):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = val
            return True
    return False

def make_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0, specular=0.5):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    set_socket(bsdf, ['Base Color'], base_color)
    set_socket(bsdf, ['Metallic'], metallic)
    set_socket(bsdf, ['Roughness'], roughness)
    set_socket(bsdf, ['Alpha'], alpha)
    set_socket(bsdf, ['Specular IOR Level', 'Specular'], specular)

    if clearcoat > 0:
        set_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], clearcoat_rough)

    if transmission > 0:
        set_socket(bsdf, ['Transmission Weight', 'Transmission'], transmission)
        set_socket(bsdf, ['IOR'], ior)

    if emission:
        set_socket(bsdf, ['Emission Color', 'Emission'], emission)
        set_socket(bsdf, ['Emission Strength'], emission_strength)

    if transmission > 0.0 or alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    return mat

def make_textured_material(name, diffuse_file=None, normal_file=None, alpha_file=None, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5, clearcoat=0.0, specular=0.5):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    set_socket(bsdf, ['Metallic'], metallic)
    set_socket(bsdf, ['Roughness'], roughness)
    set_socket(bsdf, ['Specular IOR Level', 'Specular'], specular)

    if clearcoat > 0:
        set_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)

    if diffuse_file:
        d_path = os.path.join(TEX_DIR, diffuse_file)
        if os.path.exists(d_path):
            img = bpy.data.images.load(d_path)
            t_node = nodes.new(type='ShaderNodeTexImage')
            t_node.image = img
            t_node.image.colorspace_settings.name = 'sRGB'
            links.new(t_node.outputs['Color'], bsdf.inputs['Base Color'])
        else:
            set_socket(bsdf, ['Base Color'], base_color)
    else:
        set_socket(bsdf, ['Base Color'], base_color)

    if alpha_file:
        a_path = os.path.join(TEX_DIR, alpha_file)
        if os.path.exists(a_path):
            a_img = bpy.data.images.load(a_path)
            a_node = nodes.new(type='ShaderNodeTexImage')
            a_node.image = a_img
            a_node.image.colorspace_settings.name = 'Non-Color'
            links.new(a_node.outputs['Color'], bsdf.inputs['Alpha'])
            if hasattr(mat, 'blend_method'):
                mat.blend_method = 'BLEND'

    if normal_file:
        n_path = os.path.join(TEX_DIR, normal_file)
        if os.path.exists(n_path):
            n_img = bpy.data.images.load(n_path)
            n_node = nodes.new(type='ShaderNodeTexImage')
            n_node.image = n_img
            n_node.image.colorspace_settings.name = 'Non-Color'
            norm_map = nodes.new(type='ShaderNodeNormalMap')
            norm_map.inputs['Strength'].default_value = 1.0
            links.new(n_node.outputs['Color'], norm_map.inputs['Color'])
            links.new(norm_map.outputs['Normal'], bsdf.inputs['Normal'])

    return mat

def build_upgraded_sedan():
    log("=" * 70)
    log("BUILDING HIGH-PERFORMANCE EXECUTIVE SEDAN FROM CAD MODEL")
    log("=" * 70)

    # 1. Clean scene safely
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name != "Scene Collection":
            bpy.data.collections.remove(col)

    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # 2. Build Master Materials
    mat_paint = make_pbr_material("Car_Paint_Midnight_Sapphire", (0.010, 0.040, 0.150, 1.0), metallic=0.94, roughness=0.07, clearcoat=1.0, clearcoat_rough=0.012)
    mat_carbon = make_pbr_material("Carbon_Fiber_Aero", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.20, clearcoat=0.85)
    mat_gloss_black = make_pbr_material("Trim_Piano_Gloss_Black", (0.006, 0.006, 0.008, 1.0), metallic=0.15, roughness=0.03, clearcoat=1.0)
    mat_satin_black = make_pbr_material("Trim_Satin_Charcoal", (0.020, 0.020, 0.022, 1.0), metallic=0.05, roughness=0.65, specular=0.15)
    mat_chrome = make_pbr_material("Chrome_High_Mirror", (0.97, 0.97, 0.98, 1.0), metallic=1.0, roughness=0.015, clearcoat=1.0)
    mat_glass = make_pbr_material("Glass_Dielectric_Clear", (0.92, 0.96, 1.0, 0.15), roughness=0.005, transmission=0.98, ior=1.52, alpha=0.15)
    mat_glass_tint = make_pbr_material("Glass_Executive_Tint", (0.06, 0.08, 0.12, 0.75), roughness=0.01, transmission=0.75, ior=1.52, alpha=0.75)
    mat_caliper = make_pbr_material("Brembo_Gloss_Red", (0.88, 0.02, 0.02, 1.0), metallic=0.35, roughness=0.08, clearcoat=1.0)
    mat_rotor = make_pbr_material("Brake_Rotor_CarbonCeramic", (0.30, 0.30, 0.32, 1.0), metallic=0.88, roughness=0.28)
    mat_drl = make_pbr_material("DRL_Ice_Blue_LED", (0.35, 0.85, 1.0, 1.0), roughness=0.04, emission=(0.35, 0.85, 1.0, 1.0), emission_strength=25.0)
    mat_projector = make_pbr_material("LED_Projector_White", (1.0, 1.0, 1.0, 1.0), roughness=0.04, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=35.0)
    mat_taillight = make_pbr_material("OLED_Taillight_Ruby", (1.0, 0.01, 0.01, 1.0), roughness=0.04, emission=(1.0, 0.01, 0.01, 1.0), emission_strength=22.0)
    mat_indicator = make_pbr_material("LED_Indicator_Amber", (1.0, 0.48, 0.02, 1.0), roughness=0.05, emission=(1.0, 0.48, 0.02, 1.0), emission_strength=18.0)
    mat_lens = make_pbr_material("Glass_Optical_Lens", (1.0, 1.0, 1.0, 0.10), roughness=0.005, transmission=0.98, ior=1.55, alpha=0.10)
    mat_mirror = make_pbr_material("Mirror_Reflection_Chrome", (0.99, 0.99, 0.99, 1.0), metallic=1.0, roughness=0.005)
    mat_chassis_metal = make_pbr_material("Chassis_Structural_Steel", (0.15, 0.15, 0.18, 1.0), metallic=0.92, roughness=0.30)
    mat_battery_enclosure = make_pbr_material("Battery_Pack_Aluminum", (0.28, 0.30, 0.32, 1.0), metallic=0.95, roughness=0.22)
    mat_high_voltage = make_pbr_material("High_Voltage_Orange", (0.95, 0.35, 0.02, 1.0), roughness=0.35)
    mat_suspension_alloy = make_pbr_material("Suspension_Billet_Alloy", (0.70, 0.72, 0.75, 1.0), metallic=0.95, roughness=0.18)

    # Textured materials from extracted high-res textures
    mat_tire = make_textured_material("Tire_Rubber_Master", diffuse_file=None, normal_file="Web GL Tyre Texture_02_normal.jpeg", base_color=(0.018, 0.018, 0.020, 1.0), roughness=0.82, specular=0.04)
    mat_rim_alloy = make_textured_material("Wheel_Rim_Alloy", diffuse_file="Rim.jpeg", metallic=0.98, roughness=0.10, clearcoat=0.9)
    mat_interior = make_textured_material("Interior_Executive_Leather", diffuse_file="Interior_01.jpeg", roughness=0.52, specular=0.30)
    mat_defogger = make_textured_material("Glass_Defogger_Grid", diffuse_file="defogger_2.jpeg", alpha_file="defogger_2.jpeg", roughness=0.05)

    # 3. Import Primary Exterior CAD Model
    log(f"Importing high-poly exterior CAD model from {SOURCE_FBX}...")
    bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)
    base_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Successfully loaded {len(base_meshes)} CAD mesh components.")

    # 4. Standardize Rotation (Yaw Y-Forward)
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.rotation_euler.z += math.pi

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    # 5. Scale to Executive Sport Sedan Blueprint Dimensions
    # Length: 4.88m, Width: 1.90m, Height: 1.44m
    all_corners = [obj.matrix_world @ Vector(c) for obj in base_meshes for c in obj.bound_box]
    min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
    max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
    dims = max_c - min_c

    TARGET_LENGTH = 4.880
    TARGET_WIDTH = 1.900
    TARGET_HEIGHT = 1.440

    scale_x = TARGET_WIDTH / dims.x
    scale_y = TARGET_LENGTH / dims.y
    scale_z = TARGET_HEIGHT / dims.z

    for obj in bpy.data.objects:
        if not obj.parent:
            obj.scale.x *= scale_x
            obj.scale.y *= scale_y
            obj.scale.z *= scale_z

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 6. Center X=0, Y=0 and Ground Contact at Z=0.000m
    all_corners = [obj.matrix_world @ Vector(c) for obj in base_meshes for c in obj.bound_box]
    min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
    max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
    center_x = (min_c.x + max_c.x) / 2.0
    center_y = (min_c.y + max_c.y) / 2.0

    for obj in bpy.data.objects:
        if not obj.parent:
            obj.location.x -= center_x
            obj.location.y -= center_y
            obj.location.z -= min_c.z

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    # 7. Shading, Normal Hardening & Material Assignment
    log("Applying Weighted Normal modifiers and multi-layer PBR materials...")
    for obj in base_meshes:
        name_lower = obj.name.lower()
        
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj

        # Clear custom split normals to prevent faceted artifacts
        if getattr(obj.data, "has_custom_normals", False):
            try:
                bpy.ops.mesh.customdata_custom_splitnormals_clear()
            except Exception:
                pass
        for p in obj.data.polygons:
            p.use_smooth = True

        # Add WeightedNormal modifier on main exterior body panels
        if any(k in name_lower for k in ["bodypaint", "corner", "l_cavity", "r_cavity", "dhl", "mr_paint"]):
            try:
                wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
                wn.keep_sharp = True
                wn.weight = 50
            except Exception:
                pass

        # Material classification
        target_mat = mat_paint
        if name_lower == "tyre":
            target_mat = mat_tire
        elif name_lower == "rim":
            target_mat = mat_rim_alloy
        elif name_lower == "blk.001":
            target_mat = mat_gloss_black
        elif name_lower == "caliper":
            target_mat = mat_caliper
        elif name_lower == "disk":
            target_mat = mat_rotor
        elif name_lower == "windshield":
            target_mat = mat_glass
        elif name_lower == "roof_glass":
            target_mat = mat_glass_tint
        elif name_lower == "defogger":
            target_mat = mat_defogger
        elif any(k in name_lower for k in ["mirror_glass", "cam_tex"]):
            target_mat = mat_mirror
        elif any(k in name_lower for k in ["housing", "glossy_parts", "tl_black_part", "tl_blk_sticker", "tl_housing", "support_pillar", "blk_gloss"]):
            target_mat = mat_gloss_black
        elif any(k in name_lower for k in ["grill_tex", "cam", "white_tex", "byd_design_alpha"]):
            target_mat = mat_chrome
        elif any(k in name_lower for k in ["hl_lamp_plane_tex", "tl_inside_gls", "tl_red_part"]):
            target_mat = mat_taillight
        elif any(k in name_lower for k in ["hl_gls", "hl_lamp_glaas", "outer_glas", "in_glas", "in_glass", "indicator_outer_glass"]):
            target_mat = mat_lens
        elif any(k in name_lower for k in ["glass_stirips", "glass_tex1", "led_tech_alpha", "led_alpha"]):
            target_mat = mat_drl
        elif any(k in name_lower for k in ["indicator_tex"]):
            target_mat = mat_indicator
        elif any(k in name_lower for k in ["break_light", "rare_light", "red_part", "reflectors", "glasss"]):
            target_mat = mat_taillight
        elif any(k in name_lower for k in ["crme", "crome", "crome.001", "badge", "badges", "bolt", "roof_rail", "top_chrome_tex", "v_radges"]):
            target_mat = mat_chrome
        elif any(k in name_lower for k in ["blk", "blk_mat", "plastic_parts", "mudflaps", "rubber", "wipers", "uc", "uc_tex", "tex", "grille_light_blk_part1", "grille_light_blk_tex"]):
            target_mat = mat_satin_black
        elif any(k in name_lower for k in ["antenna", "mr_paint"]):
            target_mat = mat_paint
        elif any(k in name_lower for k in ["interior", "cavity", "text", "blue_shape"]):
            target_mat = mat_interior
        else:
            target_mat = mat_paint

        obj.data.materials.clear()
        obj.data.materials.append(target_mat)

    # 8. Import Mechanical Subassemblies (Chassis & Steering & Hardware)
    chassis_path = os.path.join(PROJECT_DIR, "public", "models", "chassis", "ev_skateboard_chassis_01.glb")
    if os.path.exists(chassis_path):
        log(f"Integrating EV Skateboard Chassis from {chassis_path}...")
        bpy.ops.import_scene.gltf(filepath=chassis_path)
        for o in bpy.context.selected_objects:
            if o.type == 'MESH':
                if "side_crash" in o.name.lower() or "sill" in o.name.lower():
                    bpy.data.objects.remove(o, do_unlink=True)
                else:
                    o.name = f"GEO_Chassis_{o.name}"
                    for p in o.data.polygons: p.use_smooth = True
                    if any(k in o.name.lower() for k in ["cable", "wire", "harness"]):
                        o.data.materials.clear()
                        o.data.materials.append(mat_high_voltage)
                    elif any(k in o.name.lower() for k in ["battery", "tub", "pack", "stack"]):
                        o.data.materials.clear()
                        o.data.materials.append(mat_battery_enclosure)
                    else:
                        o.data.materials.clear()
                        o.data.materials.append(mat_chassis_metal)

    # 9. Structure into 8 Standardized Master Collections
    master_col = bpy.data.collections.new("Car_Sedan_Master")
    bpy.context.scene.collection.children.link(master_col)

    COLLECTIONS = [
        "01_Body_Main",
        "02_Bumpers_Aero",
        "03_Glass_Greenhouse",
        "04_Lighting",
        "05_Exterior_Hardware",
        "06_Running_Gear",
        "07_Interior",
        "08_Chassis_Powertrain"
    ]
    sub_cols = {}
    for c_name in COLLECTIONS:
        c = bpy.data.collections.new(c_name)
        master_col.children.link(c)
        sub_cols[c_name] = c

    all_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    for o in all_meshes:
        name_l = o.name.lower()
        dest = "01_Body_Main"
        if "chassis" in name_l or "battery" in name_l:
            dest = "08_Chassis_Powertrain"
        elif "steering" in name_l:
            dest = "06_Running_Gear"
        elif "vip" in name_l or "interior" in name_l or "cavity" in name_l or "seat" in name_l or "console" in name_l:
            dest = "07_Interior"
        elif "tyre" in name_l or "rim" in name_l or "caliper" in name_l or "disk" in name_l or "wheel" in name_l:
            dest = "06_Running_Gear"
        elif "wiper" in name_l or "handle" in name_l or "mirror" in name_l or "badge" in name_l or "crome" in name_l or "crme" in name_l:
            dest = "05_Exterior_Hardware"
        elif "windshield" in name_l or "roof_glass" in name_l or "defogger" in name_l:
            dest = "03_Glass_Greenhouse"
        elif "hl" in name_l or "tl" in name_l or "light" in name_l or "led" in name_l or "indicator" in name_l or "reflector" in name_l:
            dest = "04_Lighting"
        elif "blk" in name_l or "grill" in name_l or "diffuser" in name_l or "mudflap" in name_l or "uc" in name_l:
            dest = "02_Bumpers_Aero"
        else:
            dest = "01_Body_Main"

        for c in list(o.users_collection):
            c.objects.unlink(o)
        sub_cols[dest].objects.link(o)

    # 10. Compute Statistics
    all_corners = [o.matrix_world @ Vector(c) for o in all_meshes for c in o.bound_box]
    dim_x = max(c.x for c in all_corners) - min(c.x for c in all_corners)
    dim_y = max(c.y for c in all_corners) - min(c.y for c in all_corners)
    dim_z = max(c.z for c in all_corners) - min(c.z for c in all_corners)
    total_verts = sum(len(o.data.vertices) for o in all_meshes)
    total_faces = sum(len(o.data.polygons) for o in all_meshes)

    log(f"Vehicle Assembly Complete: {len(all_meshes)} meshes, {total_verts:,} vertices, {total_faces:,} polygons.")
    log(f"Dimensions: {dim_y:.3f}m L x {dim_x:.3f}m W x {dim_z:.3f}m H")

    return {
        "meshes": len(all_meshes),
        "vertices": total_verts,
        "polygons": total_faces,
        "dimensions": (dim_x, dim_y, dim_z)
    }

def export_all():
    log("=" * 70)
    log("[SEDAN_EXPORT] SERIALIZING UPGRADED CAD SEDAN GLBS...")
    log("=" * 70)

    # Remove non-mesh objects
    for o in list(bpy.data.objects):
        if o.type != 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)

    all_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    
    # 1. Export Master Assembled GLB
    bpy.ops.object.select_all(action='DESELECT')
    for o in all_meshes: o.select_set(True)
    if all_meshes: bpy.context.view_layer.objects.active = all_meshes[0]

    primary_complete = os.path.join(EXPORTS_DIR, "Car_Sedan_Complete.glb")
    os.makedirs(os.path.dirname(primary_complete), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=primary_complete,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT'
    )
    
    complete_copies = [
        os.path.join(PUBLIC_MODELS_DIR, "Car_Sedan_Complete.glb"),
        os.path.join(PUBLIC_VEHICLES_SEDAN_DIR, "complete-sedan.glb"),
        os.path.join(PUBLIC_MODELS_SEDAN_DIR, "complete-sedan.glb"),
        os.path.join(PUBLIC_FAMILIES_COMPLETE_DIR, "sedan_complete.glb"),
    ]
    for target in complete_copies:
        safe_copy(primary_complete, target)
        log(f"  ✓ Complete Sedan: {os.path.relpath(target, PROJECT_DIR)} ({os.path.getsize(target)/(1024*1024):.2f} MB)")

    # 2. Category Subassemblies
    # Body
    bpy.ops.object.select_all(action='DESELECT')
    body_keywords = ["bodypaint", "corner", "cavity", "roof", "windshield", "glass", "interior", "rubber", "dhl", "badge", "crome", "crme"]
    active_b = [o for o in all_meshes if any(k in o.name.lower() for k in body_keywords)]
    for o in active_b: o.select_set(True)
    if active_b:
        bpy.context.view_layer.objects.active = active_b[0]
        body_target = os.path.join(PUBLIC_FAMILIES_COMPONENTS_DIR, "body_sedan.glb")
        bpy.ops.export_scene.gltf(filepath=body_target, use_selection=True, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT')
        log(f"  ✓ Exported: body_sedan.glb ({os.path.getsize(body_target)/(1024*1024):.2f} MB)")

    # Aero
    bpy.ops.object.select_all(action='DESELECT')
    aero_keywords = ["blk", "grill", "diffuser", "mudflap", "uc"]
    active_a = [o for o in all_meshes if any(k in o.name.lower() for k in aero_keywords)]
    for o in active_a: o.select_set(True)
    if active_a:
        bpy.context.view_layer.objects.active = active_a[0]
        aero_target = os.path.join(PUBLIC_FAMILIES_COMPONENTS_DIR, "aero_sedan.glb")
        bpy.ops.export_scene.gltf(filepath=aero_target, use_selection=True, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT')
        log(f"  ✓ Exported: aero_sedan.glb ({os.path.getsize(aero_target)/(1024*1024):.2f} MB)")

    # Chassis
    bpy.ops.object.select_all(action='DESELECT')
    chassis_keywords = ["chassis", "battery", "steering"]
    active_c = [o for o in all_meshes if any(k in o.name.lower() for k in chassis_keywords)]
    for o in active_c: o.select_set(True)
    if active_c:
        bpy.context.view_layer.objects.active = active_c[0]
        chassis_target = os.path.join(PUBLIC_MODULAR_BASE, "chassis_sedan.glb")
        bpy.ops.export_scene.gltf(filepath=chassis_target, use_selection=True, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT')
        log(f"  ✓ Exported: chassis_sedan.glb ({os.path.getsize(chassis_target)/(1024*1024):.2f} MB)")

    # 3. Individual Modular Parts
    log(f"Exporting {len(all_meshes)} individual modular parts...")
    for o in all_meshes:
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        
        clean_name = o.name.replace(":", "_").replace("/", "_").lower()
        p1 = os.path.normpath(os.path.join(EXPORTS_PARTS_DIR, f"{clean_name}.glb"))
        p2 = os.path.normpath(os.path.join(PUBLIC_MODULAR_DIR, f"{clean_name}.glb"))
        
        bpy.ops.export_scene.gltf(filepath=p1, use_selection=True, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT')
        safe_copy(p1, p2)

    log("=" * 70)
    log("[SEDAN_EXPORT] ALL UPGRADED CAD GLBS EXPORTED SUCCESSFULLY.")
    log("=" * 70)

if __name__ == "__main__":
    build_upgraded_sedan()
    export_all()
