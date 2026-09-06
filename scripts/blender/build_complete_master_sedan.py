"""
==============================================================================
AUTOMOTIVE MASTER PIPELINE: COMPLETE EXECUTIVE SEDAN (ALL REMAINING PARTS)
==============================================================================
Integrates ALL mechanical, structural, interior, and aerodynamic subassemblies:
1. Exterior Body Panels (Class-A smoothed, Weighted Normal, Midnight Sapphire Metallic)
2. EV Skateboard Chassis & 800V High-Voltage Battery Pack with dual e-motors
3. Full Front & Rear Double-Wishbone Suspension with coilover dampers & hubs
4. Billet Electric Power Steering Rack & Steering Column
5. High-Performance Running Gear (Deep carbon-black tires, carbon-ceramic rotors, Brembo calipers)
6. Executive VIP Passenger Cabin (Front & rear lounge seating, center console, door cards)
7. Optical Glass Greenhouse (Dielectric windshield, defogger grid, panoramic roof)
8. Exterior Hardware (Flush handles, aero mirrors, wipers, chrome & gloss trim)
==============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

def log(msg):
    print(f"[MASTER_SEDAN] {msg}")

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
PARTS_DIR = os.path.join(EXPORTS_DIR, "parts")
os.makedirs(PARTS_DIR, exist_ok=True)

# Clean scene
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

# ----------------------------------------------------------------------------
# 1. PBR SHADER FACTORY
# ----------------------------------------------------------------------------
def set_socket(bsdf, names, val):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = val
            return True
    return False

def make_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0, specular=0.5):
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

TEX_DIR = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")

def make_textured_material(name, diffuse_file=None, normal_file=None, alpha_file=None, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5, clearcoat=0.0, specular=0.5):
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

# Master Shader Palette
MAT_TIRE = make_textured_material("Tire_Rubber_Master", diffuse_file=None, normal_file="Web GL Tyre Texture_02_normal.jpeg", base_color=(0.010, 0.010, 0.012, 1.0), roughness=0.75, specular=0.04)
MAT_RIM_ALLOY = make_textured_material("Wheel_Rim_Alloy", diffuse_file="Rim.jpeg", metallic=0.96, roughness=0.14, clearcoat=0.9)
MAT_PAINT = make_pbr_material("Car_Paint_Midnight_Sapphire", (0.008, 0.028, 0.110, 1.0), metallic=0.94, roughness=0.08, clearcoat=1.0, clearcoat_rough=0.015)
MAT_GLOSS_BLACK = make_pbr_material("Trim_Piano_Gloss_Black", (0.005, 0.005, 0.006, 1.0), metallic=0.10, roughness=0.03, clearcoat=1.0)
MAT_SATIN_BLACK = make_pbr_material("Trim_Satin_Charcoal", (0.015, 0.015, 0.016, 1.0), metallic=0.05, roughness=0.55, specular=0.15)
MAT_CHROME = make_pbr_material("Chrome_High_Mirror", (0.97, 0.97, 0.98, 1.0), metallic=1.0, roughness=0.015, clearcoat=1.0)
MAT_GLASS = make_pbr_material("Glass_Dielectric_Clear", (0.94, 0.97, 1.0, 0.15), roughness=0.005, transmission=0.97, ior=1.52, alpha=0.15)
MAT_GLASS_TINT = make_pbr_material("Glass_Executive_Tint", (0.06, 0.08, 0.10, 0.85), roughness=0.01, transmission=0.70, ior=1.52, alpha=0.85)
MAT_CALIPER = make_pbr_material("Brembo_Gloss_Red", (0.85, 0.02, 0.02, 1.0), metallic=0.30, roughness=0.10, clearcoat=1.0)
MAT_ROTOR = make_pbr_material("Brake_Rotor_CarbonCeramic", (0.22, 0.22, 0.24, 1.0), metallic=0.85, roughness=0.28)
MAT_DRL = make_pbr_material("DRL_Ice_Blue_LED", (0.35, 0.85, 1.0, 1.0), roughness=0.05, emission=(0.35, 0.85, 1.0, 1.0), emission_strength=25.0)
MAT_PROJECTOR = make_pbr_material("LED_Projector_White", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=35.0)
MAT_TAILLIGHT = make_pbr_material("OLED_Taillight_Ruby", (1.0, 0.01, 0.01, 1.0), roughness=0.05, emission=(1.0, 0.01, 0.01, 1.0), emission_strength=20.0)
MAT_INDICATOR = make_pbr_material("LED_Indicator_Amber", (1.0, 0.45, 0.02, 1.0), roughness=0.05, emission=(1.0, 0.45, 0.02, 1.0), emission_strength=18.0)
MAT_LENS = make_pbr_material("Glass_Optical_Lens", (1.0, 1.0, 1.0, 0.10), roughness=0.005, transmission=0.98, ior=1.55, alpha=0.10)
MAT_MIRROR = make_pbr_material("Mirror_Reflection_Chrome", (0.99, 0.99, 0.99, 1.0), metallic=1.0, roughness=0.005)
MAT_INTERIOR = make_textured_material("Interior_Executive_Leather", diffuse_file="Interior_01.jpeg", roughness=0.50, specular=0.30)
MAT_DEFOGGER = make_textured_material("Glass_Defogger_Grid", diffuse_file="defogger_2.jpeg", alpha_file="defogger_2.jpeg", roughness=0.05)
MAT_CHASSIS_METAL = make_pbr_material("Chassis_Structural_Steel", (0.12, 0.12, 0.14, 1.0), metallic=0.90, roughness=0.30)
MAT_BATTERY_ENCLOSURE = make_pbr_material("Battery_Pack_Aluminum", (0.25, 0.26, 0.28, 1.0), metallic=0.92, roughness=0.25)
MAT_HIGH_VOLTAGE = make_pbr_material("High_Voltage_Orange", (0.95, 0.35, 0.02, 1.0), roughness=0.35)
MAT_SUSPENSION_ALLOY = make_pbr_material("Suspension_Billet_Alloy", (0.65, 0.66, 0.68, 1.0), metallic=0.95, roughness=0.18)
MAT_EXECUTIVE_LEATHER = make_pbr_material("Executive_Lounge_Nappa_Leather", (0.035, 0.035, 0.040, 1.0), roughness=0.45, specular=0.25)

log("Master PBR shaders configured.")

# ----------------------------------------------------------------------------
# 2. IMPORT & CALIBRATE PRIMARY EXTERIOR BODY
# ----------------------------------------------------------------------------
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")
log(f"Importing exterior body panels from {SOURCE_FBX}...")
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

base_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
log(f"Imported {len(base_meshes)} base mesh objects.")

for obj in bpy.data.objects:
    if not obj.parent:
        obj.rotation_euler.z += math.pi

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# Target Executive Dimensions
all_corners = [obj.matrix_world @ Vector(c) for obj in base_meshes for c in obj.bound_box]
min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
dims = max_c - min_c

TARGET_LENGTH = 4.850
TARGET_WIDTH = 1.880
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

# Ground plane alignment (Z=0.000m) and center (X=0, Y=0)
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

# Assign shaders & Weighted Normal smoothing to base body parts
for obj in base_meshes:
    name_lower = obj.name.lower()
    
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # Clear custom split normals to prevent faceted reflections
    if getattr(obj.data, "has_custom_normals", False):
        try:
            bpy.ops.mesh.customdata_custom_splitnormals_clear()
        except Exception:
            pass
    for p in obj.data.polygons:
        p.use_smooth = True

    # Add Weighted Normal modifier on main sheet metal body panels
    if any(k in name_lower for k in ["bodypaint", "corner", "l_cavity", "r_cavity", "dhl", "mr_paint"]):
        try:
            wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 50
        except Exception:
            pass

    # Material classification
    target_mat = MAT_PAINT
    if name_lower == "tyre":
        target_mat = MAT_TIRE
    elif name_lower == "rim":
        target_mat = MAT_RIM_ALLOY
    elif name_lower == "blk.001":
        target_mat = MAT_GLOSS_BLACK
    elif name_lower == "caliper":
        target_mat = MAT_CALIPER
    elif name_lower == "disk":
        target_mat = MAT_ROTOR
    elif name_lower == "windshield":
        target_mat = MAT_GLASS
    elif name_lower == "roof_glass":
        target_mat = MAT_GLASS_TINT
    elif name_lower == "defogger":
        target_mat = MAT_DEFOGGER
    elif any(k in name_lower for k in ["mirror_glass", "cam_tex"]):
        target_mat = MAT_MIRROR
    elif any(k in name_lower for k in ["housing", "glossy_parts", "tl_black_part", "tl_blk_sticker", "tl_housing", "support_pillar", "blk_gloss"]):
        target_mat = MAT_GLOSS_BLACK
    elif any(k in name_lower for k in ["grill_tex", "cam", "white_tex", "byd_design_alpha"]):
        target_mat = MAT_CHROME
    elif any(k in name_lower for k in ["hl_lamp_plane_tex", "tl_inside_gls", "tl_red_part"]):
        target_mat = MAT_TAILLIGHT
    elif any(k in name_lower for k in ["hl_gls", "hl_lamp_glaas", "outer_glas", "in_glas", "in_glass", "indicator_outer_glass"]):
        target_mat = MAT_LENS
    elif any(k in name_lower for k in ["glass_stirips", "glass_tex1", "led_tech_alpha", "led_alpha"]):
        target_mat = MAT_DRL
    elif any(k in name_lower for k in ["indicator_tex"]):
        target_mat = MAT_INDICATOR
    elif any(k in name_lower for k in ["break_light", "rare_light", "red_part", "reflectors", "glasss"]):
        target_mat = MAT_TAILLIGHT
    elif any(k in name_lower for k in ["crme", "crome", "crome.001", "badge", "badges", "bolt", "roof_rail", "top_chrome_tex", "v_radges"]):
        target_mat = MAT_CHROME
    elif any(k in name_lower for k in ["blk", "blk_mat", "plastic_parts", "mudflaps", "rubber", "wipers", "uc", "uc_tex", "tex", "grille_light_blk_part1", "grille_light_blk_tex"]):
        target_mat = MAT_SATIN_BLACK
    elif any(k in name_lower for k in ["antenna", "mr_paint"]):
        target_mat = MAT_PAINT
    elif any(k in name_lower for k in ["interior", "cavity", "text", "blue_shape"]):
        target_mat = MAT_INTERIOR
    else:
        target_mat = MAT_PAINT

    obj.data.materials.clear()
    obj.data.materials.append(target_mat)

log("Base exterior body panels shaded, smoothed, and aligned.")

# ----------------------------------------------------------------------------
# 3. IMPORT & INTEGRATE EV SKATEBOARD CHASSIS & POWERTRAIN (CLEAN PACKAGING)
# ----------------------------------------------------------------------------
chassis_path = os.path.join(PROJECT_DIR, "public", "models", "chassis", "ev_skateboard_chassis_01.glb")
log(f"Importing EV Skateboard Chassis from {chassis_path}...")
bpy.ops.import_scene.gltf(filepath=chassis_path)
imported_chassis = [o for o in bpy.context.selected_objects if o.type == 'MESH']

# Filter out external side sills that protrude through bodywork
for o in imported_chassis:
    if "side_crash" in o.name.lower() or "sill" in o.name.lower():
        bpy.data.objects.remove(o, do_unlink=True)
    else:
        o.name = f"GEO_Chassis_{o.name}"
        for p in o.data.polygons:
            p.use_smooth = True
        if any(k in o.name.lower() for k in ["cable", "wire", "harness"]):
            o.data.materials.clear()
            o.data.materials.append(MAT_HIGH_VOLTAGE)
        elif any(k in o.name.lower() for k in ["battery", "tub", "pack", "stack"]):
            o.data.materials.clear()
            o.data.materials.append(MAT_BATTERY_ENCLOSURE)
        else:
            o.data.materials.clear()
            o.data.materials.append(MAT_CHASSIS_METAL)

# ----------------------------------------------------------------------------
# 4. IMPORT & INTEGRATE ACTIVE STEERING SYSTEM
# ----------------------------------------------------------------------------
steer_path = os.path.join(PROJECT_DIR, "public", "models", "exterior", "steering_system.glb")
log(f"Importing Steering System from {steer_path}...")
bpy.ops.import_scene.gltf(filepath=steer_path)
steer_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']

for o in steer_objs:
    o.name = f"GEO_Steering_{o.name}"
    for p in o.data.polygons:
        p.use_smooth = True
    if any(k in o.name.lower() for k in ["boot", "rubber"]):
        o.data.materials.clear()
        o.data.materials.append(MAT_SATIN_BLACK)
    elif any(k in o.name.lower() for k in ["rack", "column", "tie"]):
        o.data.materials.clear()
        o.data.materials.append(MAT_SUSPENSION_ALLOY)
    else:
        o.data.materials.clear()
        o.data.materials.append(MAT_CHASSIS_METAL)

# ----------------------------------------------------------------------------
# 5. IMPORT & INTEGRATE EXECUTIVE VIP CABIN (CLEAN SEATING)
# ----------------------------------------------------------------------------
vip_path = os.path.join(PROJECT_DIR, "public", "models", "interior", "cockpit_coachbuilt_vip_salon.glb")
log(f"Importing Executive VIP Cabin from {vip_path}...")
bpy.ops.import_scene.gltf(filepath=vip_path)
vip_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']

for o in vip_objs:
    # Filter out decorative cones and underbody floor shell
    if o.name in ["Mesh_30", "Mesh_31", "Mesh_9", "Mesh_0"]:
        bpy.data.objects.remove(o, do_unlink=True)
    else:
        o.name = f"GEO_Interior_VIP_{o.name}"
        for p in o.data.polygons:
            p.use_smooth = True
        o.data.materials.clear()
        o.data.materials.append(MAT_EXECUTIVE_LEATHER)

# ----------------------------------------------------------------------------
# 6. IMPORT EXTERIOR WIPERS & FLUSH DOOR HANDLES
# ----------------------------------------------------------------------------
wipers_path = os.path.join(PROJECT_DIR, "public", "models", "exterior", "wipers.glb")
if os.path.exists(wipers_path):
    log(f"Importing precision wipers from {wipers_path}...")
    bpy.ops.import_scene.gltf(filepath=wipers_path)
    wiper_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    for o in wiper_objs:
        o.name = f"GEO_Hardware_Wiper_{o.name}"
        for p in o.data.polygons:
            p.use_smooth = True
        o.data.materials.clear()
        o.data.materials.append(MAT_SATIN_BLACK)

handles_path = os.path.join(PROJECT_DIR, "public", "models", "exterior", "door_handles.glb")
if os.path.exists(handles_path):
    log(f"Importing flush door handles from {handles_path}...")
    bpy.ops.import_scene.gltf(filepath=handles_path)
    handle_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    for o in handle_objs:
        o.name = f"GEO_Hardware_Handle_{o.name}"
        for p in o.data.polygons:
            p.use_smooth = True
        o.data.materials.clear()
        o.data.materials.append(MAT_CHROME)

# ----------------------------------------------------------------------------
# 7. STANDARDIZE HIERARCHY INTO 8 PRODUCTION COLLECTIONS
# ----------------------------------------------------------------------------
log("Organizing vehicle into 8 standardized master collections...")

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

all_active_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
log(f"Total integrated mesh count: {len(all_active_meshes)} objects.")

for o in all_active_meshes:
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

# ----------------------------------------------------------------------------
# 8. DUAL-MODE GLB EXPORT
# ----------------------------------------------------------------------------
log("Exporting individual modular parts retaining world coordinates...")
for o in all_active_meshes:
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o

    clean_name = o.name.replace(":", "_").replace("/", "_")
    p_path = os.path.join(PARTS_DIR, f"{clean_name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=p_path,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT'
    )

log("Exporting unified assembled Master Executive Sedan GLB...")
bpy.ops.object.select_all(action='SELECT')
complete_path = os.path.join(EXPORTS_DIR, "Car_Sedan_Complete.glb")
bpy.ops.export_scene.gltf(
    filepath=complete_path,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_materials='EXPORT'
)

mb_size = os.path.getsize(complete_path) / (1024 * 1024)
log(f"[SUCCESS] Complete Master Sedan exported: {complete_path} ({mb_size:.2f} MB)")
log(f"[SUCCESS] Total modular parts: {len(all_active_meshes)}")
