"""
==============================================================================
MASTER HIGH-FIDELITY AUTOMOTIVE FLEET COMPILER (ALL 5 VEHICLE PLATFORMS)
==============================================================================
Engineers, refines, shades, packages, and exports production-grade 3D assets
with authentic CAD/high-poly geometry across all 5 core vehicle platforms:
1. Executive Sport Sedan       ('sedan')        - 4.85m x 1.88m x 1.44m (WB 2.85m)
2. Performance Hot Hatch       ('hatchback')    - 4.22m x 1.80m x 1.46m (WB 2.60m)
3. Urban Crossover AWD         ('crossover')    - 4.54m x 1.88m x 1.62m (WB 2.70m)
4. Full-Size Heavy Duty SUV    ('suv')          - 5.08m x 2.00m x 1.82m (WB 2.98m)
5. Apex GT3 Racing Supercar    ('gt3_supercar') - 4.65m x 2.04m x 1.15m (WB 2.72m)

Every vehicle strictly conforms to:
- 8 Standardized Production Collections:
  01_Body_Main, 02_Bumpers_Aero, 03_Glass_Greenhouse, 04_Lighting,
  05_Exterior_Hardware, 06_Running_Gear, 07_Interior, 08_Chassis_Powertrain
- World Coordinates: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD)
- Ground Plane Contact: Minimum tire footprint sits strictly at Z = 0.000m
- Clean Class-A Topology: Vertex welding (0.5mm) & weighted smooth normals
- Principled BSDF Physical PBR materials (clearcoat, transmission, emission)
- Dual-Mode Export:
  - Unified vehicle GLB in 'exports/Car_<Type>_Complete.glb'
  - Standalone zero-offset modular components in 'exports/parts/<type>/'
  - Synchronized directly to 'public/models/vehicles/' and 'public/vehicles/'
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import shutil
from mathutils import Vector, Matrix, Euler

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
PARTS_BASE_DIR = os.path.join(EXPORTS_DIR, "parts")
PUB_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models", "vehicles")
PUB_VEHICLES_DIR = os.path.join(PROJECT_DIR, "public", "vehicles")

os.makedirs(EXPORTS_DIR, exist_ok=True)
PARTS_BASE_DIR = os.path.join(EXPORTS_DIR, "parts")
os.makedirs(PARTS_BASE_DIR, exist_ok=True)
os.makedirs(PUB_MODELS_DIR, exist_ok=True)
os.makedirs(PUB_VEHICLES_DIR, exist_ok=True)

COLLECTIONS_ORDER = [
    "01_Body_Main",
    "02_Bumpers_Aero",
    "03_Glass_Greenhouse",
    "04_Lighting",
    "05_Exterior_Hardware",
    "06_Running_Gear",
    "07_Interior",
    "08_Chassis_Powertrain",
]

# ----------------------------------------------------------------------------
# 1. PBR SHADER SUITE FACTORY
# ----------------------------------------------------------------------------
def set_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def get_or_create_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0):
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

    if transmission > 0:
        set_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_socket(bsdf, ["IOR"], ior)
        mat.blend_method = 'BLEND'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'HASHED'

    if alpha < 1.0:
        set_socket(bsdf, ["Alpha"], alpha)
        mat.blend_method = 'BLEND'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'HASHED'

    if emission:
        set_socket(bsdf, ["Emission Color", "Emission"], emission)
        set_socket(bsdf, ["Emission Strength"], emission_strength)

    return mat

def create_global_material_suite():
    mats = {}
    # Hero paints
    mats["paint_sedan"] = get_or_create_material("Car_Paint_Midnight_Sapphire", (0.008, 0.035, 0.14, 1.0), metallic=0.94, roughness=0.08, clearcoat=1.0)
    mats["paint_hatch"] = get_or_create_material("Car_Paint_Velocity_Cyan", (0.02, 0.52, 0.88, 1.0), metallic=0.88, roughness=0.10, clearcoat=1.0)
    mats["paint_crossover"] = get_or_create_material("Car_Paint_Forest_Jade", (0.035, 0.22, 0.11, 1.0), metallic=0.90, roughness=0.12, clearcoat=1.0)
    mats["paint_suv"] = get_or_create_material("Car_Paint_Crimson_Pearl", (0.38, 0.02, 0.05, 1.0), metallic=0.92, roughness=0.09, clearcoat=1.0)
    mats["paint_gt3"] = get_or_create_material("Car_Paint_Rosso_Corsa", (0.85, 0.04, 0.06, 1.0), metallic=0.88, roughness=0.06, clearcoat=1.0)

    # Aerodynamics & Trim
    mats["carbon"] = get_or_create_material("Carbon_Fiber_Aero", (0.045, 0.045, 0.05, 1.0), metallic=0.45, roughness=0.18, clearcoat=0.95)
    mats["gloss_black"] = get_or_create_material("Trim_Piano_Gloss_Black", (0.015, 0.015, 0.018, 1.0), metallic=0.15, roughness=0.05, clearcoat=1.0)
    mats["matte_trim"] = get_or_create_material("Trim_Satin_Charcoal", (0.05, 0.05, 0.055, 1.0), metallic=0.05, roughness=0.65)
    mats["chrome"] = get_or_create_material("Chrome_High_Mirror", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.02, clearcoat=1.0)
    mats["skid_silver"] = get_or_create_material("Trim_Brushed_Silver", (0.75, 0.76, 0.78, 1.0), metallic=0.85, roughness=0.28)
    mats["mirror_glass"] = get_or_create_material("Mirror_Glass_Reflective", (0.95, 0.95, 0.95, 1.0), metallic=1.0, roughness=0.00, clearcoat=1.0)
    mats["wood_veneer"] = get_or_create_material("Interior_Wood_Veneer", (0.22, 0.12, 0.06, 1.0), metallic=0.05, roughness=0.25, clearcoat=0.85)

    # Glass
    mats["glass_clear"] = get_or_create_material("Glass_Dielectric_Clear", (0.92, 0.96, 1.0, 0.35), roughness=0.01, transmission=0.96, ior=1.52, alpha=0.35)
    mats["glass_tint"] = get_or_create_material("Glass_Executive_Tint", (0.12, 0.15, 0.20, 0.70), roughness=0.02, transmission=0.75, ior=1.52, alpha=0.70)
    mats["lens_glass"] = get_or_create_material("Glass_Optic_Projector", (0.95, 0.98, 1.0, 0.20), roughness=0.005, transmission=0.98, ior=1.55, alpha=0.20)

    # Lighting
    mats["drl_ice"] = get_or_create_material("DRL_Ice_Blue_LED", (0.2, 0.75, 1.0, 1.0), emission=(0.2, 0.75, 1.0, 1.0), emission_strength=25.0)
    mats["headlight_led"] = get_or_create_material("LED_Headlight_Optics", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=35.0)
    mats["taillight_ruby"] = get_or_create_material("OLED_Taillight_Ruby", (1.0, 0.02, 0.04, 1.0), emission=(1.0, 0.02, 0.04, 1.0), emission_strength=20.0)
    mats["indicator_amber"] = get_or_create_material("LED_Indicator_Amber", (1.0, 0.45, 0.02, 1.0), emission=(1.0, 0.45, 0.02, 1.0), emission_strength=18.0)

    # Running Gear
    mats["tire_rubber"] = get_or_create_material("Tire_Rubber_Radial", (0.028, 0.028, 0.030, 1.0), roughness=0.85)
    mats["wheel_alloy"] = get_or_create_material("Wheel_Machined_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.96, roughness=0.16, clearcoat=0.5)
    mats["wheel_dark"] = get_or_create_material("Wheel_Inner_DarkGunmetal", (0.12, 0.13, 0.15, 1.0), metallic=0.92, roughness=0.25)
    mats["brake_rotor"] = get_or_create_material("Brake_Rotor_CarbonCeramic", (0.35, 0.35, 0.38, 1.0), metallic=0.80, roughness=0.32)
    mats["brake_rotor_steel"] = get_or_create_material("Brake_Rotor_CrossDrilled", (0.65, 0.66, 0.68, 1.0), metallic=0.95, roughness=0.22)
    mats["brake_caliper"] = get_or_create_material("Brake_Caliper_Gloss_Red", (0.85, 0.04, 0.06, 1.0), metallic=0.20, roughness=0.12, clearcoat=1.0)
    mats["caliper_gold"] = get_or_create_material("Brake_Caliper_Gold", (0.88, 0.70, 0.12, 1.0), metallic=0.75, roughness=0.18, clearcoat=1.0)
    mats["caliper_acid_yellow"] = get_or_create_material("Brake_Caliper_AcidYellow", (0.85, 0.95, 0.05, 1.0), metallic=0.10, roughness=0.10, clearcoat=1.0)
    mats["caliper_silver"] = get_or_create_material("Brake_Caliper_Silver", (0.78, 0.80, 0.82, 1.0), metallic=0.90, roughness=0.20)

    mats["spring_red"] = get_or_create_material("Suspension_Spring_Red", (0.85, 0.05, 0.05, 1.0), metallic=0.25, roughness=0.20, clearcoat=0.8)
    mats["spring_yellow"] = get_or_create_material("Suspension_Spring_Yellow", (0.95, 0.85, 0.05, 1.0), metallic=0.25, roughness=0.20, clearcoat=0.8)
    mats["spring_green"] = get_or_create_material("Suspension_Spring_Green", (0.15, 0.85, 0.25, 1.0), metallic=0.25, roughness=0.20, clearcoat=0.8)
    mats["air_spring"] = get_or_create_material("Air_Suspension_Bellows", (0.04, 0.04, 0.045, 1.0), roughness=0.80)

    # Interior & Powertrain
    mats["leather_interior"] = get_or_create_material("Interior_Executive_Leather", (0.07, 0.07, 0.08, 1.0), metallic=0.05, roughness=0.65)
    mats["leather_beige"] = get_or_create_material("Interior_Nappa_Beige", (0.72, 0.65, 0.55, 1.0), metallic=0.02, roughness=0.68)
    mats["screen_oled"] = get_or_create_material("Screen_OLED_Emissive", (0.05, 0.20, 0.45, 1.0), emission=(0.15, 0.45, 0.95, 1.0), emission_strength=4.0)
    mats["battery_tub"] = get_or_create_material("Battery_Pack_Aluminum", (0.68, 0.70, 0.72, 1.0), metallic=0.90, roughness=0.25)
    mats["chassis_steel"] = get_or_create_material("Chassis_Structural_Steel", (0.20, 0.22, 0.25, 1.0), metallic=0.88, roughness=0.35)
    mats["hv_orange"] = get_or_create_material("HighVoltage_Orange", (1.0, 0.25, 0.02, 1.0), metallic=0.0, roughness=0.35)
    mats["titanium"] = get_or_create_material("Titanium_Flame_Blue", (0.45, 0.55, 0.75, 1.0), metallic=0.98, roughness=0.14, emission=(0.15, 0.35, 0.90, 1.0), emission_strength=1.5)
    mats["silicone_red"] = get_or_create_material("Silicone_Coupler_Red", (0.85, 0.12, 0.08, 1.0), metallic=0.0, roughness=0.40)
    mats["roll_cage_blue"] = get_or_create_material("RollCage_Electric_Blue", (0.05, 0.45, 0.95, 1.0), metallic=0.85, roughness=0.20, clearcoat=1.0)
    mats["harness_red"] = get_or_create_material("Racing_Harness_Sabelt", (0.90, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.60)

    # Hardware & Thermal
    mats["radiator_matrix"] = get_or_create_material("Radiator_Core_Aluminum", (0.58, 0.60, 0.62, 1.0), metallic=0.92, roughness=0.30)
    mats["fan_plastic"] = get_or_create_material("Electric_Fan_Plastic", (0.04, 0.04, 0.045, 1.0), metallic=0.05, roughness=0.50)
    mats["radar_sensor"] = get_or_create_material("Sensor_Radar_Transceiver", (0.02, 0.02, 0.025, 1.0), metallic=0.30, roughness=0.10, clearcoat=0.9)
    mats["gold_anodized"] = get_or_create_material("Anodized_Gold_Hardware", (0.92, 0.72, 0.15, 1.0), metallic=0.95, roughness=0.20)
    mats["nylon_tow_red"] = get_or_create_material("Nylon_Tow_Strap_Red", (0.85, 0.05, 0.05, 1.0), metallic=0.0, roughness=0.75)
    mats["carpet_dark"] = get_or_create_material("Interior_Carpet_Dark", (0.05, 0.05, 0.055, 1.0), roughness=0.90)
    mats["woven_stainless"] = get_or_create_material("Exhaust_Flex_Mesh", (0.75, 0.76, 0.78, 1.0), metallic=0.95, roughness=0.45)
    mats["anodized_blue"] = get_or_create_material("Anodized_Aerospace_Blue", (0.05, 0.35, 0.95, 1.0), metallic=0.95, roughness=0.18, clearcoat=0.8)
    mats["anodized_red"] = get_or_create_material("Anodized_Racing_Red", (0.95, 0.08, 0.12, 1.0), metallic=0.92, roughness=0.18, clearcoat=0.8)
    mats["gold_heatshield"] = get_or_create_material("Thermal_Gold_Heatshield", (0.95, 0.78, 0.18, 1.0), metallic=0.98, roughness=0.15, clearcoat=0.9)
    mats["textured_plastic"] = get_or_create_material("Plastic_Textured_Polypropylene", (0.04, 0.04, 0.045, 1.0), metallic=0.02, roughness=0.75)
    mats["polished_copper"] = get_or_create_material("Metal_Polished_Copper", (0.95, 0.55, 0.40, 1.0), metallic=0.98, roughness=0.22)
    mats["glow_green"] = get_or_create_material("Luminous_Emergency_Glow", (0.2, 1.0, 0.3, 1.0), emission=(0.2, 1.0, 0.3, 1.0), emission_strength=8.0)

    return mats

# ----------------------------------------------------------------------------
# 2. SCENE UTILITIES & NORMAL REFINEMENT
# ----------------------------------------------------------------------------
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for col_name in COLLECTIONS_ORDER:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)

def assign_to_collection(obj, col_name):
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)

def get_scene_mesh_bounds():
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    if not mesh_objs:
        return Vector((0,0,0)), Vector((0,0,0)), Vector((0,0,0))
    all_corners = [o.matrix_world @ Vector(o.bound_box[i]) for o in mesh_objs for i in range(8)]
    min_c = Vector((min(c[0] for c in all_corners), min(c[1] for c in all_corners), min(c[2] for c in all_corners)))
    max_c = Vector((max(c[0] for c in all_corners), max(c[1] for c in all_corners), max(c[2] for c in all_corners)))
    return min_c, max_c, max_c - min_c

def refine_all_normals_and_weld():
    print("[NORMALS] Welding vertex doubles, subdividing body panels, and applying weighted smooth normals...")
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            mesh = obj.data
            bm = bmesh.new()
            bm.from_mesh(mesh)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            for f in bm.faces:
                f.smooth = True
            bm.to_mesh(mesh)
            bm.free()
            mesh.update()

            # Class-A Surface Subdivision for main exterior painted bodywork
            n = obj.name.lower()
            if any(k in n for k in ["bodypaint", "paint_geo", "polar", "coloured"]):
                if not obj.modifiers.get("Subsurf") and len(mesh.polygons) < 60000:
                    sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
                    sub.levels = 1
                    sub.render_levels = 1

            wn = obj.modifiers.get("WeightedNormal")
            if not wn:
                wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 100

def calibrate_and_align_to_dimensions(target_len, target_w, target_h, rotate_180_z=False):
    """
    Completely flattens hierarchy, unparents meshes while preserving world matrices,
    removes non-mesh garbage empties/cameras, scales to exact target bounds, and
    anchors lowest vertex (tire contact) strictly at Z = 0.000m.
    """
    # Step 1: Unparent all meshes with world transforms preserved
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            mw = obj.matrix_world.copy()
            obj.parent = None
            obj.matrix_world = mw
        else:
            bpy.data.objects.remove(obj, do_unlink=True)

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Step 2: Invert orientation if source asset had front facing -Y
    if rotate_180_z:
        for obj in bpy.data.objects:
            if obj.type == 'MESH':
                obj.rotation_euler.z += math.radians(180)
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    # Step 3: Scale to precise bounding target dimensions
    min_c, max_c, dims = get_scene_mesh_bounds()
    if dims.x > 0 and dims.y > 0 and dims.z > 0:
        scale_x = target_w / dims.x
        scale_y = target_len / dims.y
        scale_z = target_h / dims.z

        for obj in bpy.data.objects:
            if obj.type == 'MESH':
                obj.scale.x *= scale_x
                obj.scale.y *= scale_y
                obj.scale.z *= scale_z

        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Step 4: Center X & Y, and ground Z at 0.000m
    min_c, max_c, dims = get_scene_mesh_bounds()
    center_x = (min_c.x + max_c.x) / 2.0
    center_y = (min_c.y + max_c.y) / 2.0
    shift_z = -min_c.z

    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.location.x -= center_x
            obj.location.y -= center_y
            obj.location.z += shift_z

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    min_c, max_c, dims = get_scene_mesh_bounds()
    print(f"[CALIBRATED] Length: {dims.y:.3f}m, Width: {dims.x:.3f}m, Height: {dims.z:.3f}m, Ground Z: {min_c.z:.4f}m")
    return min_c, max_c, dims

# ----------------------------------------------------------------------------
# 3. PROCEDURAL MODULAR ADDITIONS ENGINE
# ----------------------------------------------------------------------------
def make_box(name, location, size, col_name, mat):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_to_collection(obj, col_name)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, col_name, mat):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    assign_to_collection(obj, col_name)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def add_full_suspension_system(prefix, wb, track_w, ride_height, mats, spring_key="spring_red", caliper_key="brake_caliper"):
    """Adds coilovers/air springs, suspension wishbones, multi-link hubs, ventilated drilled brake discs, and multi-piston calipers."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    corners = [
        ("FL", -half_track, half_wb, True),
        ("FR", half_track, half_wb, True),
        ("RL", -half_track, -half_wb, False),
        ("RR", half_track, -half_wb, False),
    ]

    for corner, cx, cy, is_front in corners:
        hub_x = cx * 0.90
        hub_z = ride_height + 0.16

        # Upright Steering Knuckle / Hub Carrier
        make_box(f"{prefix}_Suspension_Hub_{corner}", (hub_x, cy, hub_z), (0.08, 0.10, 0.22), "06_Running_Gear", mats["chassis_steel"])

        # Spring & Damper Assembly
        damper_x = cx * 0.82
        damper_z = hub_z + 0.18
        if "air" in spring_key:
            make_cylinder(f"{prefix}_AirSpring_Bellows_{corner}", (damper_x, cy, damper_z), 0.085, 0.26, (0, 0, 0), "06_Running_Gear", mats["air_spring"])
        else:
            make_cylinder(f"{prefix}_Coilover_Damper_{corner}", (damper_x, cy, damper_z), 0.024, 0.32, (0, 0, 0), "06_Running_Gear", mats["chrome"])
            make_cylinder(f"{prefix}_Suspension_Spring_{corner}", (damper_x, cy, damper_z), 0.052, 0.24, (0, 0, 0), "06_Running_Gear", mats[spring_key])

        # Upper & Lower Control Arms / Wishbones
        arm_in_x = cx * 0.42
        make_cylinder(f"{prefix}_Lower_Control_Arm_{corner}", ((hub_x + arm_in_x)/2.0, cy, ride_height + 0.04), 0.016, abs(hub_x - arm_in_x), (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])
        make_cylinder(f"{prefix}_Upper_Control_Arm_{corner}", ((hub_x + arm_in_x * 1.1)/2.0, cy, hub_z + 0.14), 0.014, abs(hub_x - arm_in_x * 1.1), (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])

        # Ventilated & Drilled Brake Disc Assembly
        rotor_x = cx * 0.94
        disc_mat = mats["brake_rotor"] if "GT3" in prefix else mats["brake_rotor_steel"]
        make_cylinder(f"{prefix}_Ventilated_Brake_Rotor_{corner}", (rotor_x, cy, hub_z), 0.175, 0.028, (0, math.radians(90), 0), "06_Running_Gear", disc_mat)
        make_cylinder(f"{prefix}_Brake_Rotor_Hat_Bell_{corner}", (rotor_x + (0.015 if cx > 0 else -0.015), cy, hub_z), 0.085, 0.032, (0, math.radians(90), 0), "06_Running_Gear", mats["wheel_dark"])

        # Performance Monobloc Brake Caliper
        caliper_offset_y = 0.08 if is_front else -0.08
        caliper_x = cx * 0.95
        make_box(f"{prefix}_Brake_Caliper_{corner}", (caliper_x, cy + caliper_offset_y, hub_z + 0.05), (0.065, 0.16, 0.095), "06_Running_Gear", mats[caliper_key])

        # Hydraulic High-Pressure Brake Flex Hose
        hose_in_x = cx * 0.68
        make_cylinder(f"{prefix}_Brake_Flex_Hose_{corner}", ((caliper_x + hose_in_x)/2.0, cy + caliper_offset_y * 0.5, hub_z + 0.08), 0.007, 0.22, (math.radians(20), math.radians(45 if cx > 0 else -45), 0), "06_Running_Gear", mats["matte_trim"])

        # CV Axle Half-Shaft with Accordion Boots
        diff_x = 0.0
        diff_y = cy
        diff_z = ride_height + 0.10
        shaft_mid_x = (hub_x + diff_x) / 2.0
        make_cylinder(f"{prefix}_Drive_HalfShaft_{corner}", (shaft_mid_x, cy, diff_z), 0.018, abs(hub_x), (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])
        make_cylinder(f"{prefix}_CV_Joint_Boot_Outboard_{corner}", (hub_x * 0.86, cy, diff_z), 0.035, 0.065, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["matte_trim"])
        make_cylinder(f"{prefix}_CV_Joint_Boot_Inboard_{corner}", (hub_x * 0.32, cy, diff_z), 0.035, 0.065, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["matte_trim"])

def add_ev_skateboard_powertrain(prefix, wb, width, ride_height, mats):
    """Adds high-voltage battery skateboard, cast e-axle drive units, and high-voltage orange shielded busbars."""
    half_wb = wb / 2.0
    bat_len = wb * 0.88
    bat_w = width * 0.78
    bat_h = 0.14
    bat_z = ride_height + bat_h / 2.0

    make_box(f"{prefix}_HV_Battery_Pack_Skateboard", (0, 0, bat_z), (bat_w, bat_len, bat_h), "08_Chassis_Powertrain", mats["battery_tub"])
    make_box(f"{prefix}_Battery_Underbody_Armor_Titanium", (0, 0, bat_z - 0.075), (bat_w * 0.98, bat_len * 0.98, 0.012), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box(f"{prefix}_Pyro_Fuse_Disconnect_Box", (0.0, half_wb * 0.40, bat_z + 0.10), (0.16, 0.14, 0.08), "08_Chassis_Powertrain", mats["hv_orange"])

    front_y = half_wb
    rear_y = -half_wb
    make_box(f"{prefix}_Front_Drive_Unit_300kW", (0, front_y, bat_z + 0.12), (0.42, 0.44, 0.36), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box(f"{prefix}_Rear_Drive_Unit_450kW", (0, rear_y, bat_z + 0.12), (0.45, 0.48, 0.38), "08_Chassis_Powertrain", mats["chassis_steel"])

    make_cylinder(f"{prefix}_HV_Conduit_Front_L", (-0.16, front_y * 0.65, bat_z + 0.06), 0.018, front_y * 0.65, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    make_cylinder(f"{prefix}_HV_Conduit_Front_R", (0.16, front_y * 0.65, bat_z + 0.06), 0.018, front_y * 0.65, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    make_cylinder(f"{prefix}_HV_Conduit_Rear_L", (-0.16, rear_y * 0.65, bat_z + 0.06), 0.020, -rear_y * 0.65, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    make_cylinder(f"{prefix}_HV_Conduit_Rear_R", (0.16, rear_y * 0.65, bat_z + 0.06), 0.020, -rear_y * 0.65, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])

def add_exterior_hardware_accessories(prefix, front_y, rear_y, hood_z, roof_z, width, mats):
    """Adds aerodynamic mirrors, shark fin antenna, and front/rear license plates."""
    make_box(f"{prefix}_SharkFin_Roof_Antenna", (0.0, rear_y * 0.45, roof_z + 0.035), (0.06, 0.22, 0.07), "05_Exterior_Hardware", mats["gloss_black"])

    make_box(f"{prefix}_License_Plate_Front", (0.0, front_y + 0.02, 0.38), (0.52, 0.02, 0.12), "05_Exterior_Hardware", mats["chrome"])
    make_box(f"{prefix}_License_Plate_Rear", (0.0, rear_y - 0.02, 0.48), (0.52, 0.02, 0.12), "05_Exterior_Hardware", mats["chrome"])

def add_front_cooling_module(prefix, front_y, width, ride_h, mats, is_race=False):
    """Adds aluminum radiator matrix, AC condenser, dual electric fans, coolant hoses, and brake cooling ducts."""
    rad_w = width * 0.46
    rad_h = 0.36
    rad_z = ride_h + 0.28
    rad_y = front_y - 0.25

    make_box(f"{prefix}_Radiator_Matrix_Core", (0.0, rad_y, rad_z), (rad_w, 0.04, rad_h), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_box(f"{prefix}_AC_Condenser_Core", (0.0, rad_y + 0.05, rad_z), (rad_w * 0.94, 0.02, rad_h * 0.92), "08_Chassis_Powertrain", mats["radiator_matrix"])

    for side, fx in [("L", -rad_w * 0.25), ("R", rad_w * 0.25)]:
        make_cylinder(f"{prefix}_Cooling_Fan_{side}", (fx, rad_y - 0.04, rad_z), 0.13, 0.035, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["fan_plastic"])

    make_cylinder(f"{prefix}_Coolant_Hose_Upper", (-rad_w * 0.35, rad_y - 0.15, rad_z + 0.14), 0.022, 0.28, (math.radians(45), 0, 0), "08_Chassis_Powertrain", mats["matte_trim"])
    make_cylinder(f"{prefix}_Coolant_Hose_Lower", (rad_w * 0.35, rad_y - 0.15, rad_z - 0.12), 0.022, 0.28, (math.radians(-45), 0, 0), "08_Chassis_Powertrain", mats["matte_trim"])

    for d_side, dx in [("L", -width * 0.38), ("R", width * 0.38)]:
        make_cylinder(f"{prefix}_Brake_Duct_Hose_{d_side}", (dx, front_y - 0.35, ride_h + 0.12), 0.024, 0.28, (math.radians(90), 0, 0), "02_Bumpers_Aero", mats["matte_trim"])

def add_sensor_and_adas_suite(prefix, front_y, rear_y, width, ride_h, hood_z, mats):
    """Adds forward radar dome, 8x ultrasonic parking sensors, and windshield stereo ADAS camera pod."""
    make_box(f"{prefix}_Radar_Transceiver_Module", (0.0, front_y - 0.04, ride_h + 0.26), (0.12, 0.03, 0.08), "05_Exterior_Hardware", mats["radar_sensor"])

    front_sensors = [
        (-width * 0.40, front_y - 0.06),
        (-width * 0.16, front_y - 0.02),
        (width * 0.16, front_y - 0.02),
        (width * 0.40, front_y - 0.06),
    ]
    for idx, (sx, sy) in enumerate(front_sensors):
        make_cylinder(f"{prefix}_PDC_Sensor_Front_{idx+1}", (sx, sy, ride_h + 0.22), 0.011, 0.015, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["radar_sensor"])

    rear_sensors = [
        (-width * 0.40, rear_y + 0.06),
        (-width * 0.16, rear_y + 0.02),
        (width * 0.16, rear_y + 0.02),
        (width * 0.40, rear_y + 0.06),
    ]
    for idx, (sx, sy) in enumerate(rear_sensors):
        make_cylinder(f"{prefix}_PDC_Sensor_Rear_{idx+1}", (sx, sy, ride_h + 0.28), 0.011, 0.015, (math.radians(-90), 0, 0), "05_Exterior_Hardware", mats["radar_sensor"])

    make_box(f"{prefix}_ADAS_Stereo_Vision_Pod", (0.0, front_y * 0.22, hood_z + 0.44), (0.18, 0.08, 0.04), "05_Exterior_Hardware", mats["matte_trim"])

def add_cabin_controls_and_mirror(prefix, wb, width, ride_h, roof_z, mats, is_race=False):
    """Adds interior frameless rearview mirror, steering column stalks, and center armrest console."""
    mirror_y = wb * 0.18
    make_box(f"{prefix}_Interior_Rearview_Mirror", (0.0, mirror_y, roof_z - 0.12), (0.24, 0.03, 0.07), "07_Interior", mats["mirror_glass"])
    make_cylinder(f"{prefix}_Mirror_Windshield_Stem", (0.0, mirror_y + 0.04, roof_z - 0.08), 0.008, 0.08, (math.radians(35), 0, 0), "07_Interior", mats["matte_trim"])

    driver_x = -width * 0.20
    stalk_y = wb * 0.14
    stalk_z = ride_h + 0.72
    make_cylinder(f"{prefix}_Turn_Signal_Stalk_Left", (driver_x - 0.12, stalk_y, stalk_z), 0.007, 0.12, (0, math.radians(-70), 0), "07_Interior", mats["matte_trim"])
    make_cylinder(f"{prefix}_Wiper_Control_Stalk_Right", (driver_x + 0.12, stalk_y, stalk_z), 0.007, 0.12, (0, math.radians(70), 0), "07_Interior", mats["matte_trim"])

def add_wheel_fasteners_and_valves(prefix, wb, track_w, ride_h, mats, is_centerlock=False):
    """Adds 5 lug nuts or centerlock nut with safety clip, and brass tire inflation valve stems."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    corners = [
        ("FL", -half_track, half_wb),
        ("FR", half_track, half_wb),
        ("RL", -half_track, -half_wb),
        ("RR", half_track, -half_wb),
    ]

    for corner, cx, cy in corners:
        hub_z = ride_h + 0.16
        outer_x = cx * 1.02
        if is_centerlock:
            make_cylinder(f"{prefix}_Centerlock_Nut_{corner}", (outer_x, cy, hub_z), 0.042, 0.035, (0, math.radians(90), 0), "06_Running_Gear", mats["paint_gt3"] if "R" in corner else mats["roll_cage_blue"])
            make_cylinder(f"{prefix}_Centerlock_Locking_Clip_{corner}", (outer_x + (0.018 if cx > 0 else -0.018), cy, hub_z), 0.005, 0.065, (math.radians(90), 0, 0), "06_Running_Gear", mats["gold_anodized"])
        else:
            for l_idx in range(5):
                angle = l_idx * (2 * math.pi / 5.0)
                lx = outer_x
                ly = cy + math.cos(angle) * 0.058
                lz = hub_z + math.sin(angle) * 0.058
                make_cylinder(f"{prefix}_Wheel_Lug_Nut_{corner}_{l_idx+1}", (lx, ly, lz), 0.011, 0.025, (0, math.radians(90), 0), "06_Running_Gear", mats["chrome"])

        # Tire Valve Stem
        vx = outer_x
        vy = cy + 0.16
        vz = hub_z + 0.06
        make_cylinder(f"{prefix}_Tire_Valve_Stem_{corner}", (vx, vy, vz), 0.005, 0.032, (0, math.radians(70 if cx > 0 else -70), 0), "06_Running_Gear", mats["gold_anodized"])

def add_structural_subframes_and_crash_beams(prefix, wb, width, ride_h, mats, front_y=None, rear_y=None):
    """Adds front and rear bumper crash impact beams tucked safely behind bumper fascias with collapsible crush cans."""
    half_wb = wb / 2.0
    beam_w = width * 0.54

    # Front Crash Beam tucked safely behind front bumper fascia
    f_beam_y = (front_y - 0.26) if front_y is not None else (half_wb + 0.35)
    f_beam_z = ride_h + 0.25
    make_box(f"{prefix}_Front_Crash_Impact_Beam", (0.0, f_beam_y, f_beam_z), (beam_w, 0.08, 0.09), "08_Chassis_Powertrain", mats["chassis_steel"])
    for side, cx in [("L", -beam_w * 0.35), ("R", beam_w * 0.35)]:
        make_box(f"{prefix}_Front_Crush_Box_{side}", (cx, f_beam_y - 0.10, f_beam_z), (0.07, 0.14, 0.08), "08_Chassis_Powertrain", mats["chassis_steel"])

    # Rear Crash Beam tucked safely behind rear bumper fascia
    r_beam_y = (rear_y + 0.24) if rear_y is not None else (-half_wb - 0.35)
    r_beam_z = ride_h + 0.27
    make_box(f"{prefix}_Rear_Crash_Impact_Beam", (0.0, r_beam_y, r_beam_z), (beam_w, 0.08, 0.09), "08_Chassis_Powertrain", mats["chassis_steel"])
    for side, cx in [("L", -beam_w * 0.35), ("R", beam_w * 0.35)]:
        make_box(f"{prefix}_Rear_Crush_Box_{side}", (cx, r_beam_y + 0.10, r_beam_z), (0.07, 0.14, 0.08), "08_Chassis_Powertrain", mats["chassis_steel"])

def add_engine_bay_fluid_systems(prefix, front_y, width, ride_h, hood_z, mats):
    """Adds brake booster master cylinder with translucent reservoir, and windshield washer fluid tank."""
    r_x = -width * 0.32
    r_y = front_y - 0.45
    r_z = hood_z - 0.08

    make_cylinder(f"{prefix}_Brake_Booster_Vacuum_Canister", (r_x, r_y - 0.08, r_z - 0.06), 0.10, 0.08, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["matte_trim"])
    make_box(f"{prefix}_Brake_Fluid_Reservoir", (r_x, r_y, r_z), (0.09, 0.14, 0.08), "08_Chassis_Powertrain", mats["glass_clear"])
    make_cylinder(f"{prefix}_Brake_Fluid_Cap_Yellow", (r_x, r_y, r_z + 0.045), 0.024, 0.015, (0, 0, 0), "08_Chassis_Powertrain", mats["spring_yellow"])

    w_x = width * 0.34
    w_y = front_y - 0.25
    make_box(f"{prefix}_Washer_Fluid_Reservoir", (w_x, w_y, r_z - 0.12), (0.16, 0.18, 0.22), "08_Chassis_Powertrain", mats["glass_clear"])
    make_cylinder(f"{prefix}_Washer_Fluid_Cap_Blue", (w_x, w_y, r_z), 0.025, 0.012, (0, 0, 0), "08_Chassis_Powertrain", mats["roll_cage_blue"])

def add_aerodynamic_wheel_spats_and_shields(prefix, wb, width, track_w, ride_h, mats):
    """Adds aerodynamic wheel air spats tucked underbody directly in front of tires."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    spat_z = ride_h + 0.04

    for side, sx in [("L", -half_track), ("R", half_track)]:
        make_box(f"{prefix}_Aero_Wheel_Spat_F{side}", (sx, half_wb + 0.28, spat_z), (0.14, 0.012, 0.05), "02_Bumpers_Aero", mats["matte_trim"])
        make_box(f"{prefix}_Aero_Wheel_Spat_R{side}", (sx, -half_wb + 0.28, spat_z), (0.14, 0.012, 0.05), "02_Bumpers_Aero", mats["matte_trim"])

def add_cabin_seatbelts_and_door_hardware(prefix, wb, width, ride_h, roof_z, mats, is_race=False):
    """Adds 3-point seatbelt webbing with B-pillar guide loops, and emergency release buckle latches."""
    for seat, sx, sy in [("Driver", -width * 0.20, 0.0), ("Passenger", width * 0.20, 0.0)]:
        b_pillar_x = sx * 1.55
        make_box(f"{prefix}_Seatbelt_Webbing_{seat}", (b_pillar_x, sy - 0.12, ride_h + 0.62), (0.04, 0.005, 0.72), "07_Interior", mats["harness_red"] if is_race else mats["matte_trim"])
        make_cylinder(f"{prefix}_Seatbelt_Guide_Loop_{seat}", (b_pillar_x, sy - 0.12, roof_z - 0.22), 0.018, 0.02, (0, math.radians(90), 0), "07_Interior", mats["chrome"])
        make_box(f"{prefix}_Seatbelt_Latch_Buckle_{seat}", (sx * 0.45, sy - 0.14, ride_h + 0.32), (0.035, 0.045, 0.09), "07_Interior", mats["matte_trim"])
        make_box(f"{prefix}_Seatbelt_Release_Button_{seat}", (sx * 0.45, sy - 0.14, ride_h + 0.37), (0.025, 0.025, 0.015), "07_Interior", mats["paint_gt3"])

def add_fuel_or_charging_hardware(prefix, rear_y, width, ride_h, mats, is_ev=True):
    """Adds fuel filler neck with cap or high-voltage CCS2/NACS charging port receptacle with LED status ring."""
    door_x = width * 0.50
    door_y = rear_y * 0.65
    door_z = ride_h + 0.65

    if is_ev:
        make_cylinder(f"{prefix}_EV_Charge_Port_CCS2", (door_x - 0.01, door_y, door_z), 0.038, 0.04, (0, math.radians(90), 0), "05_Exterior_Hardware", mats["matte_trim"])
        make_cylinder(f"{prefix}_EV_Charge_Status_LED_Ring", (door_x - 0.005, door_y, door_z), 0.042, 0.008, (0, math.radians(90), 0), "04_Lighting", mats["drl_ice"])
    else:
        make_cylinder(f"{prefix}_Fuel_Filler_Neck", (door_x - 0.04, door_y, door_z), 0.032, 0.12, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])
        make_cylinder(f"{prefix}_Fuel_Cap_Twist", (door_x - 0.01, door_y, door_z), 0.036, 0.02, (0, math.radians(90), 0), "05_Exterior_Hardware", mats["matte_trim"])

def add_driver_pedal_box(prefix, wb, width, ride_h, mats, is_manual=False):
    """Adds accelerator organ pedal, ribbed brake pedal, dead pedal footrest, and rally clutch pedal."""
    driver_x = -width * 0.20
    pedal_y = wb * 0.22
    pedal_z = ride_h + 0.14

    make_box(f"{prefix}_Pedal_Footrest_DeadPedal", (driver_x - 0.15, pedal_y + 0.04, pedal_z + 0.04), (0.08, 0.18, 0.02), "07_Interior", mats["skid_silver"])
    make_box(f"{prefix}_Pedal_Brake_Ribbed", (driver_x, pedal_y, pedal_z + 0.08), (0.075, 0.11, 0.025), "07_Interior", mats["matte_trim"])
    make_box(f"{prefix}_Pedal_Accelerator_Organ", (driver_x + 0.10, pedal_y - 0.02, pedal_z + 0.07), (0.055, 0.17, 0.020), "07_Interior", mats["skid_silver"])

    if is_manual:
        make_box(f"{prefix}_Pedal_Clutch_Rally", (driver_x - 0.08, pedal_y, pedal_z + 0.08), (0.065, 0.10, 0.025), "07_Interior", mats["skid_silver"])

def add_windshield_cowl_and_washer_nozzles(prefix, front_y, width, hood_z, mats):
    """Adds perforated windshield cowl intake tray and twin heated washer nozzles."""
    cowl_y = front_y - 0.72
    make_box(f"{prefix}_Windshield_Cowl_Tray", (0.0, cowl_y, hood_z + 0.02), (width * 0.82, 0.16, 0.025), "05_Exterior_Hardware", mats["matte_trim"])
    for side, nx in [("L", -width * 0.24), ("R", width * 0.24)]:
        make_box(f"{prefix}_Washer_Nozzle_{side}", (nx, cowl_y - 0.04, hood_z + 0.038), (0.025, 0.025, 0.015), "05_Exterior_Hardware", mats["gloss_black"])

def add_wheel_arch_liners(prefix, wb, track_w, ride_h, mats):
    """Adds acoustic polypropylene inner fender splash shield liners tucked high above the wheels."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    for corner, cx, cy in [("FL", -half_track, half_wb), ("FR", half_track, half_wb), ("RL", -half_track, -half_wb), ("RR", half_track, -half_wb)]:
        make_box(f"{prefix}_Fender_Inner_Liner_Top_{corner}", (cx * 0.85, cy, ride_h + 0.36), (0.16, 0.58, 0.02), "08_Chassis_Powertrain", mats["matte_trim"])

def add_inner_door_handles_and_latches(prefix, wb, width, ride_h, mats, is_race=False):
    """Adds satin chrome interior door opening release levers and armrest window switchgear."""
    for side, dx in [("Driver", -width * 0.44), ("Passenger", width * 0.44)]:
        h_y = wb * 0.08
        h_z = ride_h + 0.58
        make_box(f"{prefix}_Inner_Door_Handle_{side}", (dx, h_y, h_z), (0.02, 0.10, 0.035), "07_Interior", mats["chrome"])
        make_box(f"{prefix}_Door_Armrest_Switchpack_{side}", (dx * 0.96, h_y - 0.12, h_z - 0.08), (0.04, 0.16, 0.02), "07_Interior", mats["matte_trim"])

def add_underbody_aero_and_heatshields(prefix, wb, width, ride_h, mats, is_ev=False, is_race=False):
    """Adds embossed aluminum thermal heat shielding or carbon flat floor."""
    if is_race:
        make_box(f"{prefix}_Carbon_Flat_Underfloor", (0.0, 0.0, ride_h - 0.015), (width * 0.94, wb * 1.25, 0.018), "02_Bumpers_Aero", mats["carbon"])
    elif not is_ev:
        make_box(f"{prefix}_Exhaust_Tunnel_Heat_Shield", (0.0, -wb * 0.10, ride_h + 0.08), (0.28, wb * 0.85, 0.010), "08_Chassis_Powertrain", mats["skid_silver"])

def add_steering_tie_rods_and_sway_links(prefix, wb, track_w, ride_h, mats):
    """Adds central rack-and-pinion steering tie rods with ball joints, and anti-roll bar drop end-links."""
    front_y = wb / 2.0
    rear_y = -wb / 2.0
    half_track = track_w / 2.0

    # Front Steering Rack Tie Rods
    rack_y = front_y - 0.08
    for side, sx in [("L", -1.0), ("R", 1.0)]:
        rod_len = half_track * 0.58
        mid_x = sx * (half_track * 0.42 + rod_len / 2.0)
        make_cylinder(f"{prefix}_Steering_TieRod_{side}", (mid_x, rack_y, ride_h + 0.14), 0.012, rod_len, (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])
        make_cylinder(f"{prefix}_TieRod_BallJoint_{side}", (sx * half_track * 0.86, rack_y, ride_h + 0.14), 0.022, 0.035, (0, 0, 0), "06_Running_Gear", mats["skid_silver"])

    # Front Anti-Roll Sway Bar Drop End-Links
    for side, sx in [("L", -half_track * 0.72), ("R", half_track * 0.72)]:
        make_cylinder(f"{prefix}_SwayBar_DropLink_F_{side}", (sx, front_y - 0.12, ride_h + 0.18), 0.009, 0.14, (0, 0, 0), "06_Running_Gear", mats["gold_anodized"])

    # Rear Anti-Roll Sway Bar Drop End-Links
    for side, sx in [("L", -half_track * 0.70), ("R", half_track * 0.70)]:
        make_cylinder(f"{prefix}_SwayBar_DropLink_R_{side}", (sx, rear_y + 0.12, ride_h + 0.18), 0.009, 0.14, (0, 0, 0), "06_Running_Gear", mats["gold_anodized"])

def add_front_wiper_arms_and_aeroblades(prefix, front_y, width, hood_z, mats):
    """Adds driver and passenger articulated wiper arms with rubber aeroblade wipers resting along the windshield base."""
    wiper_z = hood_z + 0.04
    wiper_y = front_y - 0.82
    # Driver Wiper
    make_cylinder(f"{prefix}_Wiper_Arm_Pivot_Driver", (-width * 0.22, wiper_y, wiper_z), 0.015, 0.03, (0, 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
    make_box(f"{prefix}_Wiper_Arm_Driver", (-width * 0.10, wiper_y + 0.06, wiper_z + 0.02), (width * 0.28, 0.018, 0.014), "05_Exterior_Hardware", mats["matte_trim"])
    make_box(f"{prefix}_Wiper_Aeroblade_Driver", (-width * 0.10, wiper_y + 0.06, wiper_z + 0.01), (width * 0.29, 0.008, 0.018), "05_Exterior_Hardware", mats["matte_trim"])
    # Passenger Wiper
    make_cylinder(f"{prefix}_Wiper_Arm_Pivot_Pass", (width * 0.18, wiper_y, wiper_z), 0.015, 0.03, (0, 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
    make_box(f"{prefix}_Wiper_Arm_Passenger", (width * 0.28, wiper_y + 0.05, wiper_z + 0.02), (width * 0.26, 0.018, 0.014), "05_Exterior_Hardware", mats["matte_trim"])
    make_box(f"{prefix}_Wiper_Aeroblade_Passenger", (width * 0.28, wiper_y + 0.05, wiper_z + 0.01), (width * 0.27, 0.008, 0.018), "05_Exterior_Hardware", mats["matte_trim"])

def add_active_grille_shutters(prefix, front_y, width, ride_h, mats, is_race=False):
    """Adds active motorized grille shutter (AGS) frame with 4 synchronized louvers."""
    ags_w = width * 0.44
    ags_h = 0.22
    ags_y = front_y - 0.15
    ags_z = ride_h + 0.24

    make_box(f"{prefix}_AGS_Frame_Housing", (0.0, ags_y, ags_z), (ags_w, 0.03, ags_h), "02_Bumpers_Aero", mats["matte_trim"])
    if is_race:
        for idx in range(3):
            lz = ags_z - 0.06 + idx * 0.06
            make_box(f"{prefix}_AGS_Carbon_Brake_Inlet_{idx+1}", (0.0, ags_y + 0.01, lz), (ags_w * 0.94, 0.012, 0.02), "02_Bumpers_Aero", mats["carbon"])
    else:
        for idx in range(4):
            lz = ags_z - 0.07 + idx * 0.045
            make_box(f"{prefix}_AGS_Motorized_Louver_{idx+1}", (0.0, ags_y + 0.01, lz), (ags_w * 0.92, 0.010, 0.025), "02_Bumpers_Aero", mats["matte_trim"])

def add_cockpit_hvac_vents_and_floor_mats(prefix, wb, width, ride_h, mats, is_race=False):
    """Adds dashboard directional HVAC air vent louvers with chrome sliders, and driver/passenger floor mats."""
    dash_y = wb * 0.18
    dash_z = ride_h + 0.68
    vent_w = 0.12
    vent_h = 0.045

    # 4 Dashboard Air Vents
    vent_x_coords = [-width * 0.38, -width * 0.12, width * 0.12, width * 0.38]
    for idx, vx in enumerate(vent_x_coords):
        make_box(f"{prefix}_HVAC_Vent_Register_{idx+1}", (vx, dash_y, dash_z), (vent_w, 0.025, vent_h), "07_Interior", mats["matte_trim"])
        make_box(f"{prefix}_HVAC_Vent_Chrome_Slider_{idx+1}", (vx, dash_y + 0.01, dash_z), (0.018, 0.015, 0.012), "07_Interior", mats["chrome"])

    # Floor Mats with Heel Pads
    mat_y = wb * 0.05
    mat_z = ride_h + 0.02
    for seat, mx in [("Driver", -width * 0.22), ("Passenger", width * 0.22)]:
        make_box(f"{prefix}_Floor_Mat_{seat}", (mx, mat_y, mat_z), (width * 0.28, 0.52, 0.012), "07_Interior", mats["carpet_dark"])
        if seat == "Driver":
            make_box(f"{prefix}_Floor_Mat_Heel_Pad", (mx, mat_y + 0.08, mat_z + 0.008), (width * 0.18, 0.18, 0.006), "07_Interior", mats["matte_trim"])

def add_powertrain_electronics_or_exhaust_aftertreatment(prefix, wb, width, ride_h, mats, is_ev=False, is_race=False):
    """Adds inverter power electronics and heat pump for EV, or catalytic converter and flex pipe for ICE."""
    if is_ev:
        make_box(f"{prefix}_Front_Inverter_Power_Electronics", (0.0, wb/2.0 * 0.72, ride_h + 0.35), (0.34, 0.28, 0.16), "08_Chassis_Powertrain", mats["skid_silver"])
        make_box(f"{prefix}_Rear_Inverter_Power_Electronics", (0.0, -wb/2.0 * 0.72, ride_h + 0.36), (0.36, 0.30, 0.18), "08_Chassis_Powertrain", mats["skid_silver"])
        make_cylinder(f"{prefix}_Heat_Pump_Climate_Compressor", (width * 0.26, wb/2.0 * 0.65, ride_h + 0.25), 0.075, 0.18, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["skid_silver"])
    elif is_race:
        make_box(f"{prefix}_Sequential_Transaxle_Gearbox", (0.0, -wb/2.0 + 0.08, ride_h + 0.22), (0.36, 0.44, 0.32), "08_Chassis_Powertrain", mats["chassis_steel"])
        make_box(f"{prefix}_Differential_Oil_Cooler_Radiator", (0.0, -wb/2.0 - 0.88, ride_h + 0.24), (0.38, 0.04, 0.18), "08_Chassis_Powertrain", mats["radiator_matrix"])
        make_cylinder(f"{prefix}_Diff_Cooler_Braided_Hose_L", (-0.14, -wb/2.0 - 0.45, ride_h + 0.22), 0.012, 0.85, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])
        make_cylinder(f"{prefix}_Diff_Cooler_Braided_Hose_R", (0.14, -wb/2.0 - 0.45, ride_h + 0.22), 0.012, 0.85, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])
    else:
        # ICE Catalytic Converter, Lambda O2 Sensors, and Woven Stainless Flex Pipe
        mid_y = 0.10
        cat_z = ride_h + 0.14
        make_cylinder(f"{prefix}_Woven_Stainless_Flex_Pipe", (0.06, mid_y + 0.35, cat_z), 0.038, 0.18, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])
        make_cylinder(f"{prefix}_Catalytic_Converter_Canister", (0.06, mid_y, cat_z), 0.065, 0.32, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])
        make_cylinder(f"{prefix}_Lambda_O2_Sensor_Upstream", (0.06, mid_y + 0.18, cat_z + 0.07), 0.009, 0.045, (0, 0, 0), "08_Chassis_Powertrain", mats["gold_anodized"])
        make_cylinder(f"{prefix}_Lambda_O2_Sensor_Downstream", (0.06, mid_y - 0.18, cat_z + 0.07), 0.009, 0.045, (0, 0, 0), "08_Chassis_Powertrain", mats["gold_anodized"])

def add_high_voltage_inverter_system(prefix, wb, ride_h, mats):
    """Adds front & rear dual-inverter power electronics with shielded orange HV cables and DC fast-charge contactors."""
    front_inv_y = wb * 0.40
    rear_inv_y = -wb * 0.40
    
    # Front Inverter & Heatsink
    make_box(f"{prefix}_HV_Inverter_Front", (0.0, front_inv_y, ride_h + 0.26), (0.38, 0.28, 0.14), "08_Chassis_Powertrain", mats["skid_silver"])
    make_box(f"{prefix}_HV_Inverter_Heatsink_Front", (0.0, front_inv_y, ride_h + 0.34), (0.34, 0.24, 0.025), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_cylinder(f"{prefix}_HV_Bus_Cable_Front_Pos", (0.08, front_inv_y - 0.14, ride_h + 0.22), 0.016, 0.26, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    make_cylinder(f"{prefix}_HV_Bus_Cable_Front_Neg", (-0.08, front_inv_y - 0.14, ride_h + 0.22), 0.016, 0.26, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    
    # Rear Inverter & Heatsink
    make_box(f"{prefix}_HV_Inverter_Rear", (0.0, rear_inv_y, ride_h + 0.26), (0.40, 0.30, 0.15), "08_Chassis_Powertrain", mats["skid_silver"])
    make_box(f"{prefix}_HV_Inverter_Heatsink_Rear", (0.0, rear_inv_y, ride_h + 0.345), (0.36, 0.26, 0.025), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_cylinder(f"{prefix}_HV_Bus_Cable_Rear_Pos", (0.08, rear_inv_y + 0.14, ride_h + 0.22), 0.016, 0.26, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    make_cylinder(f"{prefix}_HV_Bus_Cable_Rear_Neg", (-0.08, rear_inv_y + 0.14, ride_h + 0.22), 0.016, 0.26, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    
    # DC Fast-Charge Contactor Box & Copper Busbars
    make_box(f"{prefix}_HV_Contactor_Box", (0.24, 0.15, ride_h + 0.18), (0.16, 0.18, 0.10), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box(f"{prefix}_HV_Copper_Busbar", (0.24, 0.15, ride_h + 0.235), (0.12, 0.14, 0.008), "08_Chassis_Powertrain", mats["polished_copper"])

def add_electronic_parking_brake_servos(prefix, wb, track_w, ride_h, mats):
    """Adds motorized EPB servo actuators and high-pressure stainless brake lines on rear brake calipers."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    
    for side, sx in [("RL", -1), ("RR", 1)]:
        cx = sx * (half_track - 0.08)
        cy = -half_wb - 0.03
        cz = ride_h + 0.24
        make_box(f"{prefix}_EPB_Motor_Servo_{side}", (cx, cy, cz), (0.08, 0.09, 0.07), "06_Running_Gear", mats["textured_plastic"])
        make_cylinder(f"{prefix}_EPB_Connector_Harness_{side}", (cx - sx*0.02, cy + 0.04, cz + 0.02), 0.008, 0.10, (math.radians(45), 0, 0), "06_Running_Gear", mats["matte_trim"])
        make_cylinder(f"{prefix}_Brake_Hydraulic_Line_{side}", (cx + sx*0.02, cy + 0.05, cz - 0.02), 0.006, 0.16, (math.radians(-30), 0, 0), "06_Running_Gear", mats["woven_stainless"])

def add_ultrasonic_park_assist_sensors(prefix, front_y, rear_y, width, ride_h, mats):
    """Adds 8 ultrasonic park assist sonar radar pucks (4 front bumper, 4 rear bumper)."""
    front_offsets = [-width * 0.38, -width * 0.14, width * 0.14, width * 0.38]
    for idx, fx in enumerate(front_offsets):
        make_cylinder(f"{prefix}_Park_Sonar_Front_{idx+1}", (fx, front_y - 0.015, ride_h + 0.28), 0.014, 0.012, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["radar_sensor"])
    
    rear_offsets = [-width * 0.38, -width * 0.14, width * 0.14, width * 0.38]
    for idx, rx in enumerate(rear_offsets):
        make_cylinder(f"{prefix}_Park_Sonar_Rear_{idx+1}", (rx, rear_y + 0.015, ride_h + 0.32), 0.014, 0.012, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["radar_sensor"])

def add_cockpit_ergonomics_and_door_sills(prefix, wb, width, ride_h, mats, is_race=False):
    """Adds Qi wireless phone charging pad, dual illuminated cupholder rings, steering column stalks, and door sill scuff plates."""
    if not is_race:
        make_box(f"{prefix}_Cockpit_Qi_Charger_Pad", (0.0, wb * 0.14, ride_h + 0.48), (0.13, 0.20, 0.012), "07_Interior", mats["matte_trim"])
        make_box(f"{prefix}_Cockpit_Qi_Charging_Graphic", (0.0, wb * 0.14, ride_h + 0.488), (0.07, 0.07, 0.002), "07_Interior", mats["screen_oled"])
        
        make_cylinder(f"{prefix}_Cupholder_Ring_L", (-0.055, wb * 0.04, ride_h + 0.46), 0.038, 0.012, (0, 0, 0), "07_Interior", mats["drl_ice"])
        make_cylinder(f"{prefix}_Cupholder_Ring_R", (0.055, wb * 0.04, ride_h + 0.46), 0.038, 0.012, (0, 0, 0), "07_Interior", mats["drl_ice"])
        
        steer_x = -0.36
        steer_y = wb * 0.14
        steer_z = ride_h + 0.68
        make_cylinder(f"{prefix}_Steering_Stalk_Turn_Signal", (steer_x - 0.14, steer_y, steer_z), 0.007, 0.12, (0, math.radians(70), 0), "07_Interior", mats["matte_trim"])
        make_cylinder(f"{prefix}_Steering_Stalk_Wiper_Control", (steer_x + 0.14, steer_y, steer_z), 0.007, 0.12, (0, math.radians(-70), 0), "07_Interior", mats["matte_trim"])
        
        for side, sx in [("L", -1), ("R", 1)]:
            sill_x = sx * (width * 0.46)
            make_box(f"{prefix}_Door_Sill_Plate_{side}", (sill_x, -wb * 0.05, ride_h + 0.18), (0.07, 0.82, 0.012), "07_Interior", mats["skid_silver"])
            make_box(f"{prefix}_Door_Sill_Emblem_{side}", (sill_x, -wb * 0.05, ride_h + 0.188), (0.035, 0.22, 0.002), "07_Interior", mats["drl_ice"])
    else:
        for side, sx in [("L", -1), ("R", 1)]:
            sill_x = sx * (width * 0.46)
            make_box(f"{prefix}_Carbon_Sill_Guard_{side}", (sill_x, -wb * 0.05, ride_h + 0.18), (0.08, 0.85, 0.015), "07_Interior", mats["carbon"])

def add_panoramic_sunroof_track_and_sunshade(prefix, wb, width, roof_z, mats):
    """Adds dual longitudinal sunroof guide tracks, motorized roller sunshade cassette, and fabric sunshade panel."""
    track_w = width * 0.35
    track_z = roof_z - 0.035
    
    make_box(f"{prefix}_Sunroof_Guide_Rail_L", (-track_w, 0.0, track_z), (0.025, 1.45, 0.018), "03_Glass_Greenhouse", mats["skid_silver"])
    make_box(f"{prefix}_Sunroof_Guide_Rail_R", (track_w, 0.0, track_z), (0.025, 1.45, 0.018), "03_Glass_Greenhouse", mats["skid_silver"])
    make_box(f"{prefix}_Sunroof_Roller_Cassette", (0.0, -0.65, track_z - 0.01), (track_w * 1.9, 0.07, 0.03), "07_Interior", mats["matte_trim"])
    make_box(f"{prefix}_Sunroof_Sunshade_Fabric", (0.0, 0.05, track_z - 0.005), (track_w * 1.85, 1.30, 0.004), "07_Interior", mats["carpet_dark"])

def add_frunk_cargo_basin(prefix, wb, width, ride_h, mats):
    """Adds molded front trunk ('Frunk') composite storage basin with weatherseal gasket and emergency glow release handle."""
    frunk_y = wb * 0.38
    frunk_z = ride_h + 0.38
    frunk_w = width * 0.52
    frunk_l = 0.62
    
    make_box(f"{prefix}_Frunk_Cargo_Tub", (0.0, frunk_y, frunk_z), (frunk_w, frunk_l, 0.26), "08_Chassis_Powertrain", mats["textured_plastic"])
    make_box(f"{prefix}_Frunk_Weatherseal_Gasket", (0.0, frunk_y, frunk_z + 0.135), (frunk_w + 0.02, frunk_l + 0.02, 0.014), "08_Chassis_Powertrain", mats["matte_trim"])
    make_box(f"{prefix}_Frunk_Emergency_Escape_Handle", (0.0, frunk_y + 0.28, frunk_z + 0.08), (0.06, 0.03, 0.04), "08_Chassis_Powertrain", mats["glow_green"])

def add_suv_heavy_duty_systems(wb, track_w, front_y, rear_y, ride_h, mats):
    """Adds adaptive air suspension pneumatic bellows, air compressor, air tank, transfer case, locking diff, ram-air intakes, and Class-IV hitch."""
    half_wb = wb / 2.0
    half_track = track_w / 2.0
    
    for corner, sx, sy in [("FL", -1, 1), ("FR", 1, 1), ("RL", -1, -1), ("RR", 1, -1)]:
        make_cylinder(f"SUV_Air_Suspension_Bellows_{corner}", (sx * 0.60, sy * half_wb, ride_h + 0.24), 0.068, 0.24, (0, 0, 0), "08_Chassis_Powertrain", mats["air_spring"])
    
    make_cylinder("SUV_Air_Suspension_Air_Tank", (0.35, -wb * 0.18, ride_h + 0.18), 0.075, 0.62, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])
    make_box("SUV_Air_Suspension_Compressor", (-0.35, -wb * 0.18, ride_h + 0.20), (0.22, 0.26, 0.16), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("SUV_AWD_Center_Transfer_Case", (0.0, wb * 0.08, ride_h + 0.18), (0.32, 0.34, 0.24), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("SUV_Front_Differential_Unit", (0.0, wb/2.0, ride_h + 0.16), (0.26, 0.24, 0.20), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_cylinder("SUV_Rear_Locking_Differential_Carrier", (0.0, -wb/2.0, ride_h + 0.16), 0.13, 0.26, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("SUV_Rear_Diff_Cooling_Fins", (0.0, -wb/2.0 - 0.13, ride_h + 0.16), (0.22, 0.02, 0.18), "08_Chassis_Powertrain", mats["radiator_matrix"])
    
    for side, ax in [("L", -0.44), ("R", 0.44)]:
        make_box(f"SUV_Engine_Airbox_{side}", (ax, wb/2.0 + 0.18, 0.80), (0.24, 0.28, 0.22), "08_Chassis_Powertrain", mats["textured_plastic"])
        make_box(f"SUV_RamAir_Duct_{side}", (ax * 0.82, wb/2.0 + 0.40, 0.78), (0.14, 0.32, 0.08), "08_Chassis_Powertrain", mats["textured_plastic"])
    
    make_box("SUV_Tow_Hitch_Receiver_Collar", (0.0, rear_y + 0.02, 0.28), (0.14, 0.18, 0.14), "05_Exterior_Hardware", mats["chassis_steel"])
    for side, cx in [("L", -0.10), ("R", 0.10)]:
        make_cylinder(f"SUV_Safety_Chain_Loop_{side}", (cx, rear_y + 0.03, 0.26), 0.025, 0.015, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["skid_silver"])
    make_cylinder("SUV_Trailer_Wiring_7Pin_Socket", (0.14, rear_y + 0.04, 0.30), 0.022, 0.03, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["matte_trim"])

def add_crossover_adventure_pack(front_y, rear_y, wb, width, roof_z, ride_h, mats):
    """Adds front recovery winch, expedition roof cargo basket, heavy-duty underbody sump & battery armor, and bridge console shelf."""
    make_cylinder("CROSSOVER_Front_Winch_Spool", (0.0, front_y - 0.14, 0.26), 0.065, 0.26, (0, math.radians(90), 0), "05_Exterior_Hardware", mats["chassis_steel"])
    make_box("CROSSOVER_Winch_Hawse_Fairlead", (0.0, front_y - 0.02, 0.26), (0.24, 0.03, 0.09), "05_Exterior_Hardware", mats["skid_silver"])
    make_cylinder("CROSSOVER_Winch_Forged_Hook", (0.06, front_y - 0.04, 0.26), 0.035, 0.022, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["anodized_red"])
    
    make_box("CROSSOVER_Roof_Basket_Perimeter_Rail", (0.0, -0.05, roof_z + 0.07), (1.12, 1.45, 0.06), "05_Exterior_Hardware", mats["matte_trim"])
    for idx, sx in enumerate([-0.40, -0.20, 0.0, 0.20, 0.40]):
        make_box(f"CROSSOVER_Roof_Basket_Load_Slat_{idx+1}", (sx, -0.05, roof_z + 0.045), (0.03, 1.40, 0.015), "05_Exterior_Hardware", mats["skid_silver"])
    make_box("CROSSOVER_Roof_Basket_Wind_Faring", (0.0, 0.65, roof_z + 0.075), (1.08, 0.02, 0.08), "05_Exterior_Hardware", mats["gloss_black"])
    
    make_box("CROSSOVER_Underbody_Sump_Guard", (0.0, front_y - 0.50, ride_h + 0.05), (0.78, 0.65, 0.025), "02_Bumpers_Aero", mats["skid_silver"])
    make_box("CROSSOVER_Battery_Armor_Shield", (0.0, 0.0, ride_h + 0.035), (1.25, wb * 0.90, 0.025), "02_Bumpers_Aero", mats["skid_silver"])
    make_box("CROSSOVER_Bridge_Console_Lower_Shelf", (0.0, wb * 0.10, ride_h + 0.32), (0.26, 0.45, 0.02), "07_Interior", mats["leather_interior"])

def add_gt3_competition_systems(front_y, rear_y, wb, width, ride_h, roof_z, wing_z, mats):
    """Adds active DRS wing actuator, center-lock R-clips, hood & deck extraction louvers, dry-break fueling, paddle shifters, and transaxle cooler."""
    half_wb = wb / 2.0
    half_track = 1.740 / 2.0
    hood_z = 0.680
    
    make_cylinder("GT3_DRS_Actuator_Piston_Ram", (0.0, rear_y - 0.04, wing_z - 0.06), 0.018, 0.16, (math.radians(35), 0, 0), "02_Bumpers_Aero", mats["titanium"])
    make_box("GT3_DRS_Actuator_Mount_Clevis", (0.0, rear_y - 0.02, wing_z - 0.12), (0.08, 0.06, 0.06), "02_Bumpers_Aero", mats["anodized_red"])
    
    for corner, sx, sy in [("FL", -1, 1), ("FR", 1, 1), ("RL", -1, -1), ("RR", 1, -1)]:
        pin_x = sx * (half_track + 0.12)
        pin_y = sy * half_wb
        pin_z = ride_h + 0.32
        make_cylinder(f"GT3_CenterLock_Safety_Pin_{corner}", (pin_x, pin_y, pin_z), 0.006, 0.05, (0, math.radians(90), 0), "06_Running_Gear", mats["chrome"])
        make_box(f"GT3_CenterLock_Pull_Lanyard_{corner}", (pin_x + sx*0.02, pin_y, pin_z), (0.015, 0.035, 0.005), "06_Running_Gear", mats["nylon_tow_red"])
    
    for idx in range(5):
        ly = front_y - 0.55 - idx * 0.06
        make_box(f"GT3_Hood_Extraction_Louver_{idx+1}", (0.0, ly, hood_z + 0.01), (0.55, 0.04, 0.008), "02_Bumpers_Aero", mats["carbon"])
    
    for idx in range(6):
        ly = -0.45 - idx * 0.07
        make_box(f"GT3_Decklid_Heat_Louver_{idx+1}", (0.0, ly, roof_z - 0.14), (0.60, 0.045, 0.008), "02_Bumpers_Aero", mats["carbon"])
    
    make_box("GT3_Roof_Cockpit_NACA_Duct", (0.0, 0.08, roof_z + 0.01), (0.24, 0.32, 0.025), "02_Bumpers_Aero", mats["carbon"])
    make_cylinder("GT3_DryBreak_Fuel_Port_L", (-width * 0.46, -wb * 0.28, roof_z - 0.18), 0.042, 0.035, (0, math.radians(75), 0), "05_Exterior_Hardware", mats["anodized_blue"])
    make_cylinder("GT3_DryBreak_Fuel_Port_R", (width * 0.46, -wb * 0.28, roof_z - 0.18), 0.042, 0.035, (0, math.radians(-75), 0), "05_Exterior_Hardware", mats["anodized_blue"])
    
    make_box("GT3_Paddle_Shifter_Left_Downshift", (-0.38 - 0.12, wb * 0.14 - 0.03, 0.72), (0.03, 0.012, 0.12), "07_Interior", mats["carbon"])
    make_box("GT3_Paddle_Shifter_Right_Upshift", (-0.38 + 0.12, wb * 0.14 - 0.03, 0.72), (0.03, 0.012, 0.12), "07_Interior", mats["carbon"])
    
    make_box("GT3_Transaxle_Oil_Cooler_Core", (0.0, rear_y + 0.28, ride_h + 0.22), (0.38, 0.06, 0.18), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_cylinder("GT3_Transaxle_Cooler_Fan", (0.0, rear_y + 0.24, ride_h + 0.22), 0.075, 0.025, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["fan_plastic"])

def add_rally_hatch_competition_systems(front_y, rear_y, wb, width, ride_h, roof_z, mats):
    """Adds bar-and-plate intercooler, blow-off valve, remote oil cooler, brake cooling ducts, FIA cowl cutoff, hood pins, co-driver footrest."""
    make_box("HATCH_Intercooler_Bar_and_Plate_Core", (0.0, front_y - 0.10, ride_h + 0.22), (0.68, 0.09, 0.22), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_box("HATCH_Intercooler_EndTank_L", (-0.37, front_y - 0.10, ride_h + 0.22), (0.07, 0.09, 0.20), "08_Chassis_Powertrain", mats["skid_silver"])
    make_box("HATCH_Intercooler_EndTank_R", (0.37, front_y - 0.10, ride_h + 0.22), (0.07, 0.09, 0.20), "08_Chassis_Powertrain", mats["skid_silver"])
    make_cylinder("HATCH_BlowOff_Valve_Trumpet", (-0.28, wb/2.0 + 0.22, 0.64), 0.024, 0.06, (0, math.radians(45), 0), "08_Chassis_Powertrain", mats["anodized_blue"])
    
    for side, bx in [("L", -0.55), ("R", 0.55)]:
        make_box(f"HATCH_Brake_Cooling_Scoop_{side}", (bx, front_y - 0.04, ride_h + 0.14), (0.14, 0.12, 0.08), "02_Bumpers_Aero", mats["textured_plastic"])
    
    make_box("HATCH_Remote_Oil_Cooler_Core", (-0.48, front_y - 0.12, ride_h + 0.25), (0.18, 0.06, 0.14), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_cylinder("HATCH_Oil_Cooler_AN10_Feed", (-0.42, front_y - 0.16, ride_h + 0.28), 0.009, 0.22, (math.radians(60), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])
    
    make_box("HATCH_FIA_Battery_Cutoff_Mount", (-0.52, wb/2.0 - 0.12, 0.95), (0.04, 0.04, 0.02), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("HATCH_FIA_Battery_Cutoff_T_Handle", (-0.52, wb/2.0 - 0.12, 0.975), (0.06, 0.015, 0.035), "05_Exterior_Hardware", mats["anodized_red"])
    
    for side, hx in [("L", -0.42), ("R", 0.42)]:
        make_box(f"HATCH_Aerocatch_Hood_Pin_{side}", (hx, front_y - 0.38, 0.88), (0.045, 0.12, 0.006), "05_Exterior_Hardware", mats["matte_trim"])
    
    make_box("HATCH_Codriver_Footrest_Plate", (0.36, wb * 0.22, ride_h + 0.18), (0.38, 0.28, 0.015), "07_Interior", mats["skid_silver"])
    make_cylinder("HATCH_Navigator_Map_Reading_Light", (0.56, wb * 0.14, 0.92), 0.008, 0.22, (math.radians(20), math.radians(-30), 0), "07_Interior", mats["headlight_led"])

def add_sedan_executive_advanced_systems(wb, width, ride_h, roof_z, mats):
    """Adds 12V auxiliary lithium battery with terminal clamps, 800V DC-DC converter, EPS steering servo rack, air suspension valve block, interior sunvisors, rear VIP climate console, and parcel shelf subwoofer."""
    half_wb = wb / 2.0
    
    # 1. 12V Auxiliary Lithium Battery (Frunk/Bay area) with positive (red) and negative (black) terminal clamps
    bat_x = -width * 0.30
    bat_y = wb * 0.36
    bat_z = ride_h + 0.36
    make_box("SEDAN_12V_Auxiliary_Lithium_Battery", (bat_x, bat_y, bat_z), (0.24, 0.16, 0.18), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_cylinder("SEDAN_12V_Battery_Terminal_Pos", (bat_x + 0.08, bat_y + 0.05, bat_z + 0.10), 0.012, 0.02, (0, 0, 0), "08_Chassis_Powertrain", mats["anodized_red"])
    make_cylinder("SEDAN_12V_Battery_Terminal_Neg", (bat_x - 0.08, bat_y + 0.05, bat_z + 0.10), 0.012, 0.02, (0, 0, 0), "08_Chassis_Powertrain", mats["matte_trim"])
    
    # 2. 800V-to-12V High-Voltage DC-DC Converter
    dcdc_x = width * 0.28
    dcdc_y = wb * 0.36
    dcdc_z = ride_h + 0.36
    make_box("SEDAN_HV_DCDC_Converter_Module", (dcdc_x, dcdc_y, dcdc_z), (0.28, 0.22, 0.14), "08_Chassis_Powertrain", mats["skid_silver"])
    make_cylinder("SEDAN_HV_DCDC_Cable_Inlet", (dcdc_x - 0.10, dcdc_y - 0.10, dcdc_z), 0.014, 0.12, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["hv_orange"])
    
    # 3. Electric Power Steering (EPS) Motor Servo on Steering Rack & Intermediate Shaft
    eps_x = -0.18
    eps_y = half_wb - 0.06
    eps_z = ride_h + 0.16
    make_cylinder("SEDAN_EPS_Rack_Servo_Motor", (eps_x, eps_y, eps_z), 0.048, 0.18, (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])
    make_cylinder("SEDAN_Steering_Intermediate_Shaft", (-0.28, eps_y - 0.08, eps_z + 0.16), 0.012, 0.28, (math.radians(45), math.radians(-25), 0), "06_Running_Gear", mats["skid_silver"])
    make_cylinder("SEDAN_Steering_Shaft_UJoint", (-0.22, eps_y - 0.02, eps_z + 0.06), 0.022, 0.04, (0, 0, 0), "06_Running_Gear", mats["chrome"])

    # 4. Air Suspension 4-Corner Valve Distribution Block
    make_box("SEDAN_Air_Suspension_Valve_Block", (0.22, -half_wb * 0.30, ride_h + 0.20), (0.12, 0.16, 0.08), "08_Chassis_Powertrain", mats["gold_anodized"])

    # 5. Dual Interior Sunvisors with Vanity Mirrors
    visor_z = roof_z - 0.08
    visor_y = wb * 0.16
    for side, vx in [("Driver", -width * 0.24), ("Pass", width * 0.24)]:
        make_box(f"SEDAN_Sunvisor_{side}", (vx, visor_y, visor_z), (0.34, 0.14, 0.015), "07_Interior", mats["leather_interior"])
        make_box(f"SEDAN_Sunvisor_Vanity_Mirror_{side}", (vx, visor_y, visor_z - 0.008), (0.14, 0.08, 0.002), "07_Interior", mats["mirror_glass"])

    # 6. Rear VIP Cabin Climate Control Screen and Vents (Center console rear face)
    make_box("SEDAN_Rear_Climate_Control_Display", (0.0, -wb * 0.08, ride_h + 0.52), (0.14, 0.02, 0.08), "07_Interior", mats["screen_oled"])
    make_box("SEDAN_Rear_Console_Air_Vent_L", (-0.05, -wb * 0.08, ride_h + 0.44), (0.045, 0.015, 0.035), "07_Interior", mats["matte_trim"])
    make_box("SEDAN_Rear_Console_Air_Vent_R", (0.05, -wb * 0.08, ride_h + 0.44), (0.045, 0.015, 0.035), "07_Interior", mats["matte_trim"])

    # 7. Premium Audio Parcel Shelf Subwoofer Enclosure (Rear deck)
    make_cylinder("SEDAN_Rear_Deck_Subwoofer_Speaker", (0.28, -wb * 0.38, roof_z - 0.35), 0.12, 0.03, (0, 0, 0), "07_Interior", mats["wheel_dark"])
    make_cylinder("SEDAN_Rear_Deck_Subwoofer_Cone", (0.28, -wb * 0.38, roof_z - 0.34), 0.08, 0.01, (0, 0, 0), "07_Interior", mats["carbon"])

def add_rally_hatch_chassis_and_fuel_systems(front_y, rear_y, wb, width, ride_h, mats):
    """Adds strut tower turnbuckle, aluminum fuel swirl surge pot, dual external racing fuel pumps with AN lines, steering quick-release, roll cage A-pillar gussets, handheld fire extinguisher, and mudflap brackets."""
    half_wb = wb / 2.0
    
    # 1. Front Strut Tower Adjustable Turnbuckle Center Link
    make_cylinder("HATCH_Strut_Bar_Turnbuckle_Center", (0.0, half_wb - 0.02, 0.72), 0.026, 0.14, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["anodized_blue"])
    
    # 2. Aluminum Competition Fuel Surge Pot / Swirl Tank (Rear cargo trunk)
    surge_x = 0.32
    surge_y = -half_wb - 0.25
    surge_z = ride_h + 0.35
    make_cylinder("HATCH_Fuel_Surge_Swirl_Pot", (surge_x, surge_y, surge_z), 0.068, 0.24, (0, 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])
    
    # 3. Dual High-Pressure External Racing Fuel Pumps with Braided Lines
    for p_idx, px in enumerate([surge_x - 0.12, surge_x + 0.12]):
        make_cylinder(f"HATCH_HighPressure_Fuel_Pump_{p_idx+1}", (px, surge_y, surge_z - 0.08), 0.028, 0.16, (0, 0, 0), "08_Chassis_Powertrain", mats["anodized_blue"])
        make_cylinder(f"HATCH_Fuel_Braided_AN8_Line_{p_idx+1}", (px, surge_y - 0.08, surge_z - 0.02), 0.008, 0.22, (math.radians(45), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])

    # 4. Steering Column Racing Quick-Release Boss
    steer_x = -0.36
    steer_y = wb * 0.14
    steer_z = 0.86
    make_cylinder("HATCH_Steering_QuickRelease_Boss", (steer_x, steer_y - 0.04, steer_z - 0.02), 0.042, 0.045, (math.radians(28), 0, 0), "07_Interior", mats["anodized_red"])

    # 5. Dimpled Lightening Roll Cage A-Pillar Gusset Plates
    for side, gx in [("L", -0.52), ("R", 0.52)]:
        make_box(f"HATCH_RollCage_A_Pillar_Gusset_{side}", (gx, 0.15, 0.98), (0.012, 0.12, 0.14), "07_Interior", mats["roll_cage_blue"])

    # 6. Cockpit Handheld AFFF Fire Extinguisher (Passenger footwell)
    ext_x = 0.36
    ext_y = 0.12
    ext_z = ride_h + 0.14
    make_cylinder("HATCH_Cockpit_Extinguisher_Bottle", (ext_x, ext_y, ext_z), 0.045, 0.28, (0, math.radians(90), 0), "07_Interior", mats["spring_red"])
    make_box("HATCH_Extinguisher_QuickRelease_Clamp", (ext_x, ext_y, ext_z + 0.04), (0.16, 0.03, 0.05), "07_Interior", mats["gold_anodized"])

    # 7. 4x Stainless Steel Mudflap Retaining Brackets & Anti-Sail Links
    for flap_pos, fx, fy in [("FL", -0.78, half_wb - 0.26), ("FR", 0.78, half_wb - 0.26), ("RL", -0.78, -half_wb - 0.26), ("RR", 0.78, -half_wb - 0.26)]:
        make_box(f"HATCH_Mudflap_Bracket_{flap_pos}", (fx, fy + 0.02, 0.22), (0.015, 0.035, 0.12), "05_Exterior_Hardware", mats["skid_silver"])

    # 8. Co-driver Door Carbon Pacenote Document Tray
    make_box("HATCH_Codriver_Pacenote_Carbon_Tray", (width * 0.44, 0.05, 0.65), (0.035, 0.28, 0.16), "07_Interior", mats["carbon"])

def add_crossover_overland_adventure_hardware(front_y, rear_y, wb, width, roof_z, ride_h, mats):
    """Adds dual MaxTrax-style recovery traction boards on roof rack, lower bumper LED fog projectors, underbody spare wheel winch and compact spare, heavy-duty rock slider sill bars, retractable cargo tonneau cassette, and 12V AGM auxiliary battery."""
    half_wb = wb / 2.0
    
    # 1. Dual High-Visibility Orange Recovery Traction Boards (Mounted to roof rack slats)
    board_z = roof_z + 0.10
    make_box("CROSSOVER_Recovery_Traction_Board_1", (-0.22, 0.15, board_z), (0.28, 1.05, 0.025), "05_Exterior_Hardware", mats["hv_orange"])
    make_box("CROSSOVER_Recovery_Traction_Board_2", (-0.22, 0.15, board_z + 0.03), (0.28, 1.05, 0.025), "05_Exterior_Hardware", mats["hv_orange"])

    # 2. Lower Bumper LED Projector Fog Lamps
    fog_y = front_y - 0.14
    fog_z = ride_h + 0.18
    for side, fx in [("L", -width * 0.36), ("R", width * 0.36)]:
        make_cylinder(f"CROSSOVER_LED_Fog_Lamp_Lens_{side}", (fx, fog_y, fog_z), 0.042, 0.035, (math.radians(90), 0, 0), "04_Lighting", mats["headlight_led"])
        make_cylinder(f"CROSSOVER_LED_Fog_Bezel_{side}", (fx, fog_y + 0.01, fog_z), 0.052, 0.015, (math.radians(90), 0, 0), "02_Bumpers_Aero", mats["gloss_black"])

    # 3. Underbody Rear Spare Wheel Winch Hoist & Compact Spare Wheel Assembly
    spare_y = -half_wb - 0.42
    spare_z = ride_h + 0.12
    make_box("CROSSOVER_Spare_Tire_Cable_Winch", (0.0, spare_y, spare_z + 0.12), (0.12, 0.12, 0.08), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_cylinder("CROSSOVER_Compact_Spare_Tire", (0.0, spare_y, spare_z), 0.28, 0.14, (0, 0, 0), "08_Chassis_Powertrain", mats["tire_rubber"])
    make_cylinder("CROSSOVER_Compact_Spare_Rim", (0.0, spare_y, spare_z), 0.20, 0.145, (0, 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])

    # 4. Heavy-Duty Tubular Steel Rock Slider Sills (Driver & Passenger sides)
    slider_y = 0.0
    slider_z = ride_h + 0.10
    for side, sx in [("L", -width * 0.48), ("R", width * 0.48)]:
        make_cylinder(f"CROSSOVER_Rocker_Rock_Slider_Tube_{side}", (sx, slider_y, slider_z), 0.024, wb * 0.82, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
        make_box(f"CROSSOVER_Rock_Slider_Mount_Front_{side}", (sx * 0.90, half_wb * 0.55, slider_z), (0.12, 0.04, 0.04), "05_Exterior_Hardware", mats["chassis_steel"])
        make_box(f"CROSSOVER_Rock_Slider_Mount_Rear_{side}", (sx * 0.90, -half_wb * 0.55, slider_z), (0.12, 0.04, 0.04), "05_Exterior_Hardware", mats["chassis_steel"])

    # 5. Rear Cargo Trunk Retractable Tonneau Cover Roller Cassette & Handle
    tonneau_y = -half_wb - 0.15
    tonneau_z = ride_h + 0.58
    make_box("CROSSOVER_Cargo_Tonneau_Roller_Cassette", (0.0, tonneau_y, tonneau_z), (width * 0.72, 0.06, 0.05), "07_Interior", mats["matte_trim"])
    make_box("CROSSOVER_Cargo_Tonneau_Blind_Sheet", (0.0, tonneau_y - 0.25, tonneau_z), (width * 0.70, 0.48, 0.005), "07_Interior", mats["leather_interior"])
    make_box("CROSSOVER_Cargo_Tonneau_Pull_Handle", (0.0, tonneau_y - 0.49, tonneau_z), (0.14, 0.025, 0.015), "07_Interior", mats["chrome"])

    # 6. 12V Auxiliary AGM Battery with Stamped Hold-Down Bracket
    bat_x = width * 0.32
    bat_y = half_wb * 0.75
    bat_z = ride_h + 0.42
    make_box("CROSSOVER_12V_AGM_Battery", (bat_x, bat_y, bat_z), (0.24, 0.16, 0.18), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("CROSSOVER_Battery_TieDown_Bracket", (bat_x, bat_y, bat_z + 0.095), (0.26, 0.04, 0.015), "08_Chassis_Powertrain", mats["anodized_red"])

def add_suv_heavy_duty_powertrain_and_chassis_details(front_y, rear_y, wb, width, ride_h, mats):
    """Adds heavy-duty chassis frame tubular crossmembers, finned transmission oil pan with drain plug, engine oil dipstick, active roll stabilizer actuators, underbody full-size spare tire, rear blind-spot radar sensors, and 3rd row cup holders."""
    half_wb = wb / 2.0
    
    # 1. Heavy-Duty Steel Frame Crossmembers (Box-section & Tubular Ladder Frame Reinforcements)
    make_cylinder("SUV_HeavyDuty_Crossmember_Front_Tube", (0.0, half_wb + 0.10, ride_h + 0.14), 0.038, width * 0.62, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("SUV_HeavyDuty_Crossmember_Center_Box", (0.0, 0.0, ride_h + 0.12), (width * 0.60, 0.14, 0.08), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_cylinder("SUV_HeavyDuty_Crossmember_Rear_Tube", (0.0, -half_wb - 0.22, ride_h + 0.18), 0.042, width * 0.64, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])

    # 2. 9-Speed Automatic Transmission Finned Aluminum Oil Pan with Drain Bolt
    pan_y = half_wb * 0.42
    pan_z = ride_h + 0.08
    make_box("SUV_Transmission_Oil_Pan_Finned", (0.0, pan_y, pan_z), (0.36, 0.44, 0.08), "08_Chassis_Powertrain", mats["skid_silver"])
    make_cylinder("SUV_Transmission_Drain_Bolt", (0.12, pan_y - 0.14, pan_z - 0.045), 0.012, 0.018, (0, 0, 0), "08_Chassis_Powertrain", mats["chrome"])
    for fin_idx in range(5):
        make_box(f"SUV_Transmission_Cooling_Fin_{fin_idx+1}", (0.0, pan_y - 0.16 + fin_idx * 0.08, pan_z - 0.042), (0.32, 0.012, 0.012), "08_Chassis_Powertrain", mats["skid_silver"])

    # 3. Engine Oil Dipstick Tube & Bright Yellow Pull Ring Handle (Engine Bay)
    dip_x = -0.32
    dip_y = half_wb + 0.24
    dip_z = 0.96
    make_cylinder("SUV_Engine_Dipstick_Tube", (dip_x, dip_y, dip_z - 0.16), 0.007, 0.32, (0, 0, 0), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_cylinder("SUV_Engine_Dipstick_PullRing", (dip_x, dip_y, dip_z + 0.02), 0.018, 0.010, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["spring_yellow"])

    # 4. Front & Rear Active Roll Stabilization (ARS) Hydraulic Rotary Actuators
    make_cylinder("SUV_Active_Roll_Stabilizer_Front", (0.0, half_wb - 0.14, ride_h + 0.18), 0.045, 0.16, (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])
    make_cylinder("SUV_Active_Roll_Stabilizer_Rear", (0.0, -half_wb + 0.14, ride_h + 0.20), 0.045, 0.16, (0, math.radians(90), 0), "06_Running_Gear", mats["chassis_steel"])

    # 5. Full-Size Off-Road Spare Wheel Hoisted Underbody Behind Rear Axle
    spare_y = -half_wb - 0.45
    spare_z = ride_h + 0.14
    make_cylinder("SUV_Underbody_Spare_Tire_Radial", (0.0, spare_y, spare_z), 0.36, 0.22, (0, 0, 0), "08_Chassis_Powertrain", mats["tire_rubber"])
    make_cylinder("SUV_Underbody_Spare_Rim_Machined", (0.0, spare_y, spare_z), 0.25, 0.23, (0, 0, 0), "08_Chassis_Powertrain", mats["wheel_alloy"])
    make_cylinder("SUV_Underbody_Spare_Hoist_Cable", (0.0, spare_y, spare_z + 0.14), 0.008, 0.12, (0, 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])

    # 6. Rear Quarter Bumper Blind-Spot Radar Modules
    for side, bx in [("L", -width * 0.44), ("R", width * 0.44)]:
        make_box(f"SUV_BlindSpot_Radar_Module_{side}", (bx, rear_y + 0.32, ride_h + 0.45), (0.08, 0.04, 0.07), "05_Exterior_Hardware", mats["radar_sensor"])

    # 7. 3rd-Row Passenger Armrest Molded Cupholders and USB-C Charging Ports
    for side, cx in [("L", -width * 0.38), ("R", width * 0.38)]:
        make_cylinder(f"SUV_3rdRow_Cupholder_{side}", (cx, -wb * 0.36, 0.72), 0.038, 0.05, (0, 0, 0), "07_Interior", mats["matte_trim"])
        make_box(f"SUV_3rdRow_USBC_Port_{side}", (cx, -wb * 0.30, 0.73), (0.02, 0.03, 0.015), "07_Interior", mats["matte_trim"])

def add_gt3_aerospace_and_cockpit_racing_gear(front_y, rear_y, wb, width, ride_h, roof_z, mats):
    """Adds carbon air intake plenum with ram horn runners, dry-sump oil reservoir with AN12 scavenge lines, FIA driver window safety net, cockpit brake bias balance dial, multi-function steering yoke buttons, roof radio telemetry spire, and FIA timing transponder."""
    half_wb = wb / 2.0
    
    # 1. Carbon Fiber Engine Air Intake Plenum Manifold & Ram Horn Runners
    plenum_y = -wb * 0.08
    plenum_z = 0.58
    make_box("GT3_Carbon_Intake_Plenum_Manifold", (0.0, plenum_y, plenum_z), (0.46, 0.32, 0.16), "08_Chassis_Powertrain", mats["carbon"])
    for r_idx in range(6):
        rx = -0.18 + r_idx * 0.072
        make_cylinder(f"GT3_Ram_Horn_Intake_Runner_{r_idx+1}", (rx, plenum_y - 0.14, plenum_z - 0.04), 0.020, 0.12, (math.radians(45), 0, 0), "08_Chassis_Powertrain", mats["carbon"])

    # 2. Billet Aluminum Dry-Sump Oil Tank Reservoir & Braided AN-12 Scavenge Lines
    tank_x = 0.38
    tank_y = -wb * 0.05
    tank_z = ride_h + 0.28
    make_cylinder("GT3_DrySump_Oil_Tank_Reservoir", (tank_x, tank_y, tank_z), 0.072, 0.34, (0, 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])
    make_cylinder("GT3_DrySump_Oil_Sight_Glass", (tank_x - 0.065, tank_y, tank_z), 0.010, 0.18, (0, 0, 0), "08_Chassis_Powertrain", mats["glass_clear"])
    make_cylinder("GT3_DrySump_AN12_Feed_Line", (tank_x, tank_y - 0.10, tank_z - 0.10), 0.015, 0.36, (math.radians(50), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])
    make_cylinder("GT3_DrySump_AN12_Return_Line", (tank_x - 0.04, tank_y - 0.10, tank_z - 0.06), 0.015, 0.36, (math.radians(50), 0, 0), "08_Chassis_Powertrain", mats["woven_stainless"])

    # 3. FIA Driver Safety Window Net with Quick-Release Latch
    net_x = -width * 0.44
    net_y = 0.0
    net_z = 0.85
    make_box("GT3_Driver_Window_Safety_Net", (net_x, net_y, net_z), (0.008, 0.48, 0.34), "07_Interior", mats["matte_trim"])
    make_cylinder("GT3_Window_Net_Top_Rod", (net_x, net_y, net_z + 0.17), 0.006, 0.50, (math.radians(90), 0, 0), "07_Interior", mats["skid_silver"])
    make_box("GT3_Window_Net_QuickRelease_Buckle", (net_x, net_y + 0.22, net_z + 0.17), (0.018, 0.035, 0.02), "07_Interior", mats["anodized_red"])

    # 4. In-Cockpit Dual Master Cylinder Brake Bias Balance Bar Adjuster Dial
    bias_x = -0.16
    bias_y = wb * 0.08
    bias_z = ride_h + 0.42
    make_cylinder("GT3_Brake_Bias_Adjuster_Knob", (bias_x, bias_y, bias_z), 0.016, 0.025, (0, 0, 0), "07_Interior", mats["gold_anodized"])
    make_cylinder("GT3_Brake_Bias_Flexible_Cable", (bias_x, bias_y + 0.08, bias_z - 0.02), 0.005, 0.18, (math.radians(40), 0, 0), "07_Interior", mats["matte_trim"])

    # 5. Tactile Color-Coded Steering Yoke Pushbuttons (Pit, Radio, Drink, Flash, FCY, Launch)
    yoke_x = -0.38
    yoke_y = wb * 0.14
    yoke_z = 0.72
    btn_configs = [
        ("Pit_Limiter", -0.06, 0.04, mats["spring_yellow"]),
        ("Radio_PTT", 0.06, 0.04, mats["roll_cage_blue"]),
        ("HighBeam_Flash", -0.06, 0.0, mats["headlight_led"]),
        ("FCY_Speed", 0.06, 0.0, mats["anodized_red"]),
        ("Launch_Control", 0.0, -0.04, mats["glow_green"]),
    ]
    for b_name, ox, oz, b_mat in btn_configs:
        make_cylinder(f"GT3_Yoke_Button_{b_name}", (yoke_x + ox, yoke_y + 0.018, yoke_z + oz), 0.008, 0.012, (math.radians(90), 0, 0), "07_Interior", b_mat)

    # 6. Roof Low-Drag VHF Telemetry Spire Antenna
    make_cylinder("GT3_Roof_Telemetry_Spire_Antenna", (0.0, -0.22, roof_z + 0.09), 0.005, 0.18, (0, 0, 0), "05_Exterior_Hardware", mats["skid_silver"])

    # 7. Official FIA Timing Transponder Receiver Puck (Front Lower Cowl)
    make_cylinder("GT3_FIA_Timing_Transponder_Puck", (0.32, front_y - 0.35, ride_h + 0.15), 0.025, 0.025, (0, 0, 0), "05_Exterior_Hardware", mats["anodized_red"])

    # 8. Mechanical Pedal Box Reach Adjuster Lever
    make_cylinder("GT3_Pedal_Reach_Adjuster_Lever", (-width * 0.20 + 0.14, wb * 0.20, ride_h + 0.22), 0.008, 0.16, (math.radians(35), 0, 0), "07_Interior", mats["skid_silver"])

def add_sedan_luxury_cockpit_and_chassis_amenities(wb, width, ride_h, roof_z, front_y, rear_y, mats):
    """Adds wiper motor & transmission linkage, windshield stereo ADAS camera pod, electrochromic interior mirror, frunk gas struts & safety striker, frunk perimeter LED, trunk motorized spindle struts & emergency escape handle, mirror puddle lights & turn signal light pipes, seatbelt buckles, and ISOFIX anchors."""
    half_wb = wb / 2.0
    
    # 1. Under-Cowl Electric Wiper Motor & Articulated Stamped Linkage
    make_box("SEDAN_Wiper_Motor_Assembly", (0.0, front_y - 0.78, 0.92), (0.14, 0.12, 0.10), "05_Exterior_Hardware", mats["chassis_steel"])
    make_box("SEDAN_Wiper_Transmission_Linkage", (0.0, front_y - 0.76, 0.93), (width * 0.45, 0.025, 0.015), "05_Exterior_Hardware", mats["skid_silver"])

    # 2. Windshield Upper ADAS Vision Pod, Rain Sensor & Frameless Electrochromic Mirror
    make_box("SEDAN_Windshield_Stereo_ADAS_Camera_Pod", (0.0, wb * 0.12, roof_z - 0.06), (0.18, 0.12, 0.04), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("SEDAN_Interior_Rearview_Electrochromic_Mirror", (0.0, wb * 0.14, roof_z - 0.10), (0.24, 0.018, 0.07), "07_Interior", mats["mirror_glass"])
    make_cylinder("SEDAN_Rain_Light_Solar_Sensor", (0.0, wb * 0.12, roof_z - 0.04), 0.022, 0.008, (0, 0, 0), "05_Exterior_Hardware", mats["radar_sensor"])

    # 3. Frunk Power Hood Polished Gas Lift Struts, Striker, and Perimeter LED Illumination
    for side, sx in [("L", -width * 0.38), ("R", width * 0.38)]:
        make_cylinder(f"SEDAN_Frunk_Hood_Gas_Strut_{side}", (sx, front_y - 0.55, ride_h + 0.42), 0.008, 0.38, (math.radians(-35), 0, 0), "08_Chassis_Powertrain", mats["chrome"])
    make_box("SEDAN_Frunk_Safety_Latch_Striker", (0.0, front_y - 0.32, ride_h + 0.46), (0.06, 0.03, 0.04), "08_Chassis_Powertrain", mats["chrome"])
    make_box("SEDAN_Frunk_Perimeter_LED_Light", (0.0, front_y - 0.55, ride_h + 0.55), (width * 0.58, 0.52, 0.008), "04_Lighting", mats["headlight_led"])

    # 4. Trunk Lid Power Spindle Struts & Emergency Fluorescent Interior Glow Handle
    for side, tx in [("L", -width * 0.42), ("R", width * 0.42)]:
        make_cylinder(f"SEDAN_Trunk_Power_Spindle_Strut_{side}", (tx, rear_y + 0.42, ride_h + 0.54), 0.012, 0.35, (math.radians(30), 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("SEDAN_Trunk_Emergency_Escape_Handle", (0.0, rear_y + 0.18, ride_h + 0.65), (0.08, 0.02, 0.02), "07_Interior", mats["glow_green"])

    # 5. Exterior Mirror Puddle Lamps & LED Turn Signal Light Pipes
    for side, mx in [("L", -width * 0.50), ("R", width * 0.50)]:
        make_cylinder(f"SEDAN_Mirror_Puddle_Light_{side}", (mx, wb * 0.22, 0.88), 0.015, 0.006, (0, 0, 0), "04_Lighting", mats["drl_ice"])
        make_box(f"SEDAN_Mirror_Turn_Signal_LightPipe_{side}", (mx * 1.04, wb * 0.22, 0.94), (0.008, 0.12, 0.015), "04_Lighting", mats["indicator_amber"])

    # 6. Cabin Seatbelt Buckles with Red Release Buttons & Rear ISOFIX Child Anchors
    buckle_coords = [
        ("FL", -0.20, -0.05, ride_h + 0.38),
        ("FR", 0.20, -0.05, ride_h + 0.38),
        ("RL", -0.24, -wb * 0.26, ride_h + 0.38),
        ("RR", 0.24, -wb * 0.26, ride_h + 0.38),
        ("Center", 0.0, -wb * 0.26, ride_h + 0.38),
    ]
    for b_name, bx, by, bz in buckle_coords:
        make_box(f"SEDAN_Seatbelt_Buckle_{b_name}", (bx, by, bz), (0.035, 0.045, 0.12), "07_Interior", mats["matte_trim"])
    make_box("SEDAN_ISOFIX_Anchor_Rear_L", (-0.35, -wb * 0.28, ride_h + 0.35), (0.14, 0.03, 0.02), "07_Interior", mats["skid_silver"])
    make_box("SEDAN_ISOFIX_Anchor_Rear_R", (0.35, -wb * 0.28, ride_h + 0.35), (0.14, 0.03, 0.02), "07_Interior", mats["skid_silver"])

def add_rally_hatch_competition_powertrain_and_aero(front_y, rear_y, wb, width, ride_h, roof_z, mats):
    """Adds billet oil catch can with breather, 4x red coil-on-plug packs, competition downpipe, metallic cat, midpipe resonator, front/rear red tow straps, interior roof eyeball vents, and tailgate wiper motor."""
    half_wb = wb / 2.0

    # 1. Billet Aluminum Oil Catch Can with Breather Filter & Silicone PCV Hoses
    can_x = -width * 0.28
    can_y = wb/2.0 + 0.05
    can_z = ride_h + 0.44
    make_cylinder("HATCH_Billet_Oil_Catch_Can", (can_x, can_y, can_z), 0.042, 0.18, (0, 0, 0), "08_Chassis_Powertrain", mats["anodized_red"])
    make_cylinder("HATCH_Catch_Can_Breather_Filter", (can_x, can_y, can_z + 0.12), 0.026, 0.06, (0, 0, 0), "08_Chassis_Powertrain", mats["radiator_matrix"])
    make_cylinder("HATCH_PCV_Silicone_Vacuum_Hose_1", (can_x + 0.06, can_y + 0.05, can_z + 0.06), 0.008, 0.20, (math.radians(35), math.radians(45), 0), "08_Chassis_Powertrain", mats["silicone_red"])
    make_cylinder("HATCH_PCV_Silicone_Vacuum_Hose_2", (can_x + 0.04, can_y + 0.09, can_z + 0.04), 0.008, 0.22, (math.radians(-30), math.radians(40), 0), "08_Chassis_Powertrain", mats["silicone_red"])

    # 2. High-Output Competition Red Ignition Coil Packs (Cylinder head valley)
    for c_idx in range(4):
        make_box(f"HATCH_Ignition_Coil_Pack_{c_idx+1}", (-0.12 + c_idx * 0.08, wb/2.0 + 0.16, 0.745), (0.045, 0.045, 0.025), "08_Chassis_Powertrain", mats["anodized_red"])

    # 3. Stainless Downpipe, High-Flow Metallic Cat & Resonator
    make_cylinder("HATCH_Exhaust_Competition_Downpipe", (0.24, wb/2.0 + 0.12, 0.38), 0.042, 0.36, (math.radians(65), 0, 0), "08_Chassis_Powertrain", mats["titanium"])
    make_cylinder("HATCH_Exhaust_HighFlow_Metallic_Cat", (0.12, 0.25, ride_h + 0.12), 0.062, 0.26, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["skid_silver"])
    make_cylinder("HATCH_Exhaust_Midpipe_Resonator", (-0.05, -0.22, ride_h + 0.12), 0.058, 0.32, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["titanium"])

    # 4. Front & Rear Competition High-Visibility Red Woven Tow Straps
    make_box("HATCH_Bumper_Tow_Strap_Front", (width * 0.28, front_y - 0.08, ride_h + 0.16), (0.04, 0.16, 0.008), "05_Exterior_Hardware", mats["nylon_tow_red"])
    make_box("HATCH_Bumper_Tow_Strap_Rear", (-width * 0.28, rear_y + 0.08, ride_h + 0.20), (0.04, 0.16, 0.008), "05_Exterior_Hardware", mats["nylon_tow_red"])

    # 5. Rally Roof Air Vent Directional Cabin Eyeball Ducts
    make_cylinder("HATCH_Roof_Air_Vent_Eyeball_L", (-0.08, 0.20, roof_z - 0.04), 0.025, 0.02, (math.radians(45), 0, 0), "07_Interior", mats["matte_trim"])
    make_cylinder("HATCH_Roof_Air_Vent_Eyeball_R", (0.08, 0.20, roof_z - 0.04), 0.025, 0.02, (math.radians(45), 0, 0), "07_Interior", mats["matte_trim"])

    # 6. Tailgate Wiper Motor, Articulated Arm, and High-Pressure Washer Jet
    make_box("HATCH_Tailgate_Wiper_Pivot_Motor", (0.0, rear_y + 0.15, 1.02), (0.08, 0.06, 0.06), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("HATCH_Tailgate_Articulated_Wiper_Arm", (-0.08, rear_y + 0.13, 1.08), (0.28, 0.015, 0.015), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("HATCH_Tailgate_Washer_Jet", (0.0, rear_y + 0.18, roof_z - 0.08), (0.02, 0.02, 0.012), "05_Exterior_Hardware", mats["gloss_black"])

def add_crossover_expedition_powertrain_and_utility(front_y, rear_y, wb, width, roof_z, ride_h, mats):
    """Adds roof rack dual LED pod lights with lenses, high-lift farm jack with climbing latch, AWD rear e-Axle motor & gearbox, forged red bow shackles, and interior overhead console with sunglasses bin."""
    # 1. Dual High-Intensity Forward Off-Road LED Pod Lights on Roof Basket
    for side, px in [("L", -0.35), ("R", 0.35)]:
        make_box(f"CROSSOVER_Roof_LED_LightPod_{side}", (px, 0.82, roof_z + 0.16), (0.08, 0.08, 0.08), "04_Lighting", mats["gloss_black"])
        make_cylinder(f"CROSSOVER_Roof_LED_Lens_{side}", (px, 0.86, roof_z + 0.16), 0.035, 0.01, (math.radians(90), 0, 0), "04_Lighting", mats["headlight_led"])

    # 2. High-Lift Off-Road Farm Jack Assembly (Mounted to Roof Basket Rail)
    jack_x = width * 0.44
    make_box("CROSSOVER_HighLift_Jack_Steel_Beam", (jack_x, 0.0, roof_z + 0.10), (0.025, 1.15, 0.06), "05_Exterior_Hardware", mats["chassis_steel"])
    make_box("CROSSOVER_HighLift_Jack_Reversing_Latch", (jack_x, -0.35, roof_z + 0.10), (0.06, 0.16, 0.12), "05_Exterior_Hardware", mats["anodized_red"])
    make_box("CROSSOVER_HighLift_Jack_Handle_Keeper", (jack_x, 0.15, roof_z + 0.14), (0.035, 0.05, 0.04), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("CROSSOVER_Jack_Mounting_Bracket_F", (jack_x - 0.01, 0.42, roof_z + 0.07), (0.04, 0.04, 0.06), "05_Exterior_Hardware", mats["skid_silver"])
    make_box("CROSSOVER_Jack_Mounting_Bracket_R", (jack_x - 0.01, -0.42, roof_z + 0.07), (0.04, 0.04, 0.06), "05_Exterior_Hardware", mats["skid_silver"])

    # 3. AWD Rear e-Axle Drive Motor & Integrated Gearbox Assembly
    make_cylinder("CROSSOVER_Rear_eAxle_Drive_Motor", (0.0, -wb/2.0 - 0.08, ride_h + 0.18), 0.11, 0.26, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("CROSSOVER_Rear_eAxle_Reduction_Gearbox", (0.16, -wb/2.0 - 0.08, ride_h + 0.18), (0.18, 0.22, 0.22), "08_Chassis_Powertrain", mats["skid_silver"])
    make_box("CROSSOVER_Rear_eAxle_Shield_Plate", (0.0, -wb/2.0 - 0.08, ride_h + 0.05), (0.48, 0.38, 0.015), "08_Chassis_Powertrain", mats["skid_silver"])

    # 4. Rear Bumper Heavy-Duty Forged Red Bow Recovery Shackles
    for side, sx in [("L", -width * 0.28), ("R", width * 0.28)]:
        make_cylinder(f"CROSSOVER_Rear_Recovery_Shackle_{side}", (sx, rear_y - 0.03, ride_h + 0.18), 0.024, 0.014, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["anodized_red"])
        make_box(f"CROSSOVER_Rear_Shackle_Isolator_{side}", (sx, rear_y - 0.03, ride_h + 0.18), (0.05, 0.018, 0.05), "05_Exterior_Hardware", mats["matte_trim"])

    # 5. Interior Overhead Console with Sunglasses Bin & Map Reading Lamps
    make_box("CROSSOVER_Overhead_Console_Housing", (0.0, wb * 0.16, roof_z - 0.05), (0.18, 0.32, 0.04), "07_Interior", mats["matte_trim"])
    make_box("CROSSOVER_Sunglasses_Dropdown_Bin", (0.0, wb * 0.10, roof_z - 0.055), (0.14, 0.16, 0.025), "07_Interior", mats["leather_interior"])
    make_box("CROSSOVER_Overhead_Map_Lamp_L", (-0.05, wb * 0.22, roof_z - 0.05), (0.035, 0.04, 0.005), "07_Interior", mats["headlight_led"])
    make_box("CROSSOVER_Overhead_Map_Lamp_R", (0.05, wb * 0.22, roof_z - 0.05), (0.035, 0.04, 0.005), "07_Interior", mats["headlight_led"])

def add_suv_v8_twin_turbo_and_executive_suite(front_y, rear_y, wb, width, ride_h, roof_z, mats):
    """Adds hot-V twin turbochargers with wastegates, pressurized coolant expansion surge tank, quad polished oval exhaust tips, 2nd-row executive console with dual touchscreens, and power tailgate spindle struts."""
    half_wb = wb / 2.0

    # 1. 4.0L Biturbo V8 Hot-V Twin Turbochargers, Compressors, Wastegates & Downpipes
    for side, tx in [("L", -0.14), ("R", 0.14)]:
        make_cylinder(f"SUV_HotV_TwinTurbo_Turbine_{side}", (tx, half_wb + 0.16, 0.88), 0.065, 0.08, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["titanium"])
        make_cylinder(f"SUV_HotV_TwinTurbo_Compressor_{side}", (tx, half_wb + 0.24, 0.88), 0.060, 0.08, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["skid_silver"])
        make_cylinder(f"SUV_HotV_Wastegate_Actuator_{side}", (tx * 1.5, half_wb + 0.18, 0.94), 0.022, 0.06, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["chrome"])
        make_cylinder(f"SUV_HotV_Stainless_Downpipe_{side}", (tx, half_wb + 0.05, 0.72), 0.038, 0.36, (math.radians(45), 0, 0), "08_Chassis_Powertrain", mats["titanium"])

    # 2. Engine Bay Pressurized Coolant Expansion Tank with Safety Pressure Cap
    tank_x = width * 0.32
    tank_y = half_wb + 0.20
    make_box("SUV_Coolant_Expansion_Tank_Translucent", (tank_x, tank_y, 0.94), (0.18, 0.22, 0.18), "08_Chassis_Powertrain", mats["screen_oled"])
    make_cylinder("SUV_Radiator_Cap_Pressure_Safety", (tank_x, tank_y, 1.04), 0.032, 0.02, (0, 0, 0), "08_Chassis_Powertrain", mats["anodized_blue"])
    make_cylinder("SUV_Coolant_Overflow_Siphon_Hose", (tank_x, tank_y + 0.08, 0.98), 0.008, 0.24, (math.radians(50), 0, 0), "08_Chassis_Powertrain", mats["matte_trim"])

    # 3. Rear Transverse Acoustic Mufflers & Quad Oval Polished Exhaust Outlets
    for side, mx in [("L", -0.38), ("R", 0.38)]:
        make_box(f"SUV_Rear_Exhaust_Muffler_{side}", (mx, rear_y + 0.49, ride_h + 0.22), (0.24, 0.36, 0.18), "08_Chassis_Powertrain", mats["skid_silver"])

    # 4. 2nd-Row Executive Waterfall Center Console with Dual OLED Displays
    make_box("SUV_2ndRow_Executive_Center_Console", (0.0, -wb * 0.08, ride_h + 0.46), (0.26, 0.52, 0.30), "07_Interior", mats["leather_interior"])
    make_box("SUV_2ndRow_Console_Cupholder_Pair", (0.0, -wb * 0.02, ride_h + 0.62), (0.18, 0.10, 0.02), "07_Interior", mats["chrome"])
    make_box("SUV_Seatback_Entertainment_OLED_L", (-width * 0.22, wb * 0.06, 1.08), (0.32, 0.02, 0.20), "07_Interior", mats["screen_oled"])
    make_box("SUV_Seatback_Entertainment_OLED_R", (width * 0.22, wb * 0.06, 1.08), (0.32, 0.02, 0.20), "07_Interior", mats["screen_oled"])

    # 5. Dual Motorized Power Tailgate Lift Spindle Struts & Concealed Roof Wiper
    for side, sx in [("L", -0.52), ("R", 0.52)]:
        make_cylinder(f"SUV_Tailgate_Power_Spindle_Strut_{side}", (sx, rear_y + 0.29, 0.88), 0.014, 0.45, (math.radians(40), 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("SUV_Rear_Spoiler_Concealed_Wiper_Arm", (0.0, rear_y + 0.08, roof_z - 0.05), (0.34, 0.02, 0.02), "05_Exterior_Hardware", mats["matte_trim"])

def add_gt3_advanced_motorsport_systems(front_y, rear_y, wb, width, ride_h, roof_z, mats):
    """Adds center monoblade carbon wiper with aero deflector, front bumper carbon dive planes/canards, underbody venturi ground effect tunnels, pit pneumatic air jack lance socket, coiled steering telemetry umbilical cord, and roll cage hydration bottle."""
    # 1. Central Motorsport Monoblade Windshield Wiper with Carbon Aero Foil
    make_cylinder("GT3_Monoblade_Wiper_Base_Pivot", (0.0, front_y - 0.74, 0.69), 0.018, 0.035, (0, 0, 0), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("GT3_Monoblade_Wiper_Arm", (0.0, front_y - 0.74, 0.88), (0.022, 0.016, 0.44), "05_Exterior_Hardware", mats["carbon"])
    make_box("GT3_Monoblade_Carbon_Aero_Deflector", (0.0, front_y - 0.73, 0.88), (0.045, 0.008, 0.42), "05_Exterior_Hardware", mats["carbon"])

    # 2. Front Bumper Curved Carbon Fiber Vortex Canards (Stacked Dual Planes)
    for side, cx in [("L", -width * 0.46), ("R", width * 0.46)]:
        make_box(f"GT3_Bumper_Vortex_Canard_Upper_{side}", (cx, front_y - 0.25, ride_h + 0.34), (0.20, 0.16, 0.012), "02_Bumpers_Aero", mats["carbon"])
        make_box(f"GT3_Bumper_Vortex_Canard_Lower_{side}", (cx * 1.02, front_y - 0.18, ride_h + 0.22), (0.22, 0.18, 0.012), "02_Bumpers_Aero", mats["carbon"])

    # 3. Underbody Aerodynamic Venturi Ground-Effect Tunnels & Diffuser Fences
    for side, tx in [("L", -width * 0.28), ("R", width * 0.28)]:
        make_box(f"GT3_Underbody_Venturi_Tunnel_{side}", (tx, 0.0, ride_h + 0.02), (0.34, wb * 0.90, 0.035), "02_Bumpers_Aero", mats["carbon"])
        make_box(f"GT3_Diffuser_Vortex_Fence_{side}", (tx * 1.5, rear_y + 0.05, ride_h + 0.12), (0.015, 0.40, 0.18), "02_Bumpers_Aero", mats["carbon"])

    # 4. Pit-Stop High-Speed Pneumatic Air Jack Wand Receptacle
    make_cylinder("GT3_AirJack_Pneumatic_Wand_Receptacle", (width * 0.45, -wb * 0.12, 0.76), 0.028, 0.02, (0, math.radians(90), 0), "05_Exterior_Hardware", mats["anodized_red"])

    # 5. Cockpit Coiled Steering Telemetry Umbilical Cord
    make_cylinder("GT3_Steering_Coiled_Telemetry_Cord", (-0.38, wb * 0.15, 0.64), 0.014, 0.16, (math.radians(45), 0, 0), "07_Interior", mats["matte_trim"])

    # 6. Driver Hydration System Clamped to Roll Cage Upright
    make_cylinder("GT3_Driver_Hydration_Bottle", (-0.12, -0.05, 0.65), 0.045, 0.22, (0, 0, 0), "07_Interior", mats["skid_silver"])
    make_box("GT3_Driver_Hydration_Mount_Clamp", (-0.12, -0.05, 0.65), (0.10, 0.10, 0.04), "07_Interior", mats["anodized_blue"])
    make_cylinder("GT3_Hydration_Bite_Valve_Tube", (-0.22, 0.02, 0.72), 0.005, 0.32, (math.radians(35), math.radians(35), 0), "07_Interior", mats["silicone_red"])

    # 7. Front Brake Cooling High-Temp Neoprene Corrugated Duct Hoses
    for side, sx in [("FL", -width * 0.32), ("FR", width * 0.32)]:
        rot_y = math.radians(20) if "L" in side else math.radians(-20)
        make_cylinder(f"GT3_Brake_Cooling_Corrugated_Hose_{side}", (sx, wb/2.0 - 0.15, ride_h + 0.12), 0.028, 0.28, (math.radians(70), rot_y, 0), "06_Running_Gear", mats["matte_trim"])

# ----------------------------------------------------------------------------
# 4. DUAL-MODE EXPORT ENGINE
# ----------------------------------------------------------------------------
def export_active_vehicle(cat_id, unified_name):
    """
    Exports:
    1. Standalone zero-offset modular components in 'exports/parts/<cat_id>/<obj_name>.glb'
    2. Master unified vehicle GLB in 'exports/<unified_name>'
    3. Direct sync to 'public/models/vehicles/' and 'public/vehicles/'
    """
    cat_parts_dir = os.path.join(PARTS_BASE_DIR, cat_id)
    os.makedirs(cat_parts_dir, exist_ok=True)

    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    print(f"\n[EXPORT] Exporting {len(mesh_objs)} standalone modular components for '{cat_id}'...")

    skip_parts = "--master-only" in sys.argv
    if not skip_parts:
        for obj in mesh_objs:
            clean_name = obj.name.replace(":", "_").replace("/", "_").replace("\\", "_")
            if len(clean_name) > 60:
                import hashlib
                h = hashlib.md5(clean_name.encode('utf-8')).hexdigest()[:8]
                clean_name = f"{clean_name[:48]}_{h}"
            part_glb = os.path.join(cat_parts_dir, f"{clean_name}.glb")

            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj

            orig_loc = obj.location.copy()
            orig_rot = obj.rotation_euler.copy()

            bpy.ops.export_scene.gltf(
                filepath=part_glb,
                use_selection=True,
                export_format='GLB',
                export_apply=True,
                export_yup=True
            )

            obj.location = orig_loc
            obj.rotation_euler = orig_rot
    else:
        print(f"[EXPORT] Skipping standalone part exports (--master-only active)")

    # Master Unified Vehicle GLB
    master_glb_path = os.path.join(EXPORTS_DIR, unified_name)
    print(f"[EXPORT] Exporting master assembled GLB: {master_glb_path}...")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=master_glb_path,
        use_selection=False,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )

    # Direct Web Sync
    dest1 = os.path.join(PUB_MODELS_DIR, cat_id, f"complete-{cat_id}.glb")
    dest2 = os.path.join(PUB_VEHICLES_DIR, cat_id, f"complete-{cat_id}.glb")
    os.makedirs(os.path.dirname(dest1), exist_ok=True)
    os.makedirs(os.path.dirname(dest2), exist_ok=True)
    shutil.copy2(master_glb_path, dest1)
    shutil.copy2(master_glb_path, dest2)
    print(f"[SYNC] Successfully updated public web models:\n -> {dest1}\n -> {dest2}")

# ----------------------------------------------------------------------------
# 5. INDIVIDUAL VEHICLE COMPILERS
# ----------------------------------------------------------------------------
def build_sedan():
    print("\n" + "="*70)
    print(">>> COMPILING EXECUTIVE SPORT SEDAN (SEDAN)")
    print("="*70)
    reset_scene()
    mats = create_global_material_suite()

    src_fbx = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")
    bpy.ops.import_scene.fbx(filepath=src_fbx)

    min_c, max_c, dims = calibrate_and_align_to_dimensions(target_len=4.850, target_w=1.880, target_h=1.440, rotate_180_z=True)

    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        n = obj.name.lower()
        if any(k in n for k in ["bodypaint", "corner", "cavity", "mr_paint"]):
            assign_to_collection(obj, "01_Body_Main")
            obj.data.materials.clear()
            obj.data.materials.append(mats["paint_sedan"])
        elif any(k in n for k in ["blk", "grill", "mudflaps", "uc"]):
            assign_to_collection(obj, "02_Bumpers_Aero")
            obj.data.materials.clear()
            obj.data.materials.append(mats["gloss_black"] if "gloss" in n else mats["matte_trim"])
        elif any(k in n for k in ["glass", "windshield", "defogger"]):
            assign_to_collection(obj, "03_Glass_Greenhouse")
            obj.data.materials.clear()
            obj.data.materials.append(mats["glass_clear"] if "windshield" in n else mats["glass_tint"])
        elif any(k in n for k in ["hl", "dhl", "break_light", "light", "lamp", "indicator"]):
            assign_to_collection(obj, "04_Lighting")
            obj.data.materials.clear()
            if "break" in n:
                obj.data.materials.append(mats["taillight_ruby"])
            elif "dhl" in n:
                obj.data.materials.append(mats["drl_ice"])
            else:
                obj.data.materials.append(mats["headlight_led"])
        elif any(k in n for k in ["badge", "crme", "crome", "antenna", "cam", "bolt", "byd"]):
            assign_to_collection(obj, "05_Exterior_Hardware")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chrome"])
        elif any(k in n for k in ["caliper", "disk", "wheel", "rim", "tire", "tyre"]):
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            if "caliper" in n:
                obj.data.materials.append(mats["brake_caliper"])
            elif "disk" in n:
                obj.data.materials.append(mats["brake_rotor"])
            elif "tire" in n or "tyre" in n:
                obj.data.materials.append(mats["tire_rubber"])
            else:
                obj.data.materials.append(mats["wheel_alloy"])
        elif any(k in n for k in ["interior", "seat", "dashboard"]):
            assign_to_collection(obj, "07_Interior")
            obj.data.materials.clear()
            obj.data.materials.append(mats["leather_interior"])
        else:
            assign_to_collection(obj, "01_Body_Main")

    wb = 2.850
    ride_h = 0.135
    track_w = 1.620
    front_y = max_c.y
    rear_y = min_c.y
    roof_z = 1.406

    add_ev_skateboard_powertrain("SEDAN", wb, 1.880, ride_h, mats)
    add_full_suspension_system("SEDAN", wb, track_w, ride_h, mats, spring_key="spring_red", caliper_key="brake_caliper")
    add_wheel_fasteners_and_valves("SEDAN", wb, track_w, ride_h, mats, is_centerlock=False)
    add_front_cooling_module("SEDAN", front_y, 1.880, ride_h, mats)
    add_sensor_and_adas_suite("SEDAN", front_y, rear_y, 1.880, ride_h, 0.920, mats)
    add_cabin_controls_and_mirror("SEDAN", wb, 1.880, ride_h, roof_z, mats)
    add_exterior_hardware_accessories("SEDAN", front_y, rear_y, 0.920, roof_z, 1.880, mats)
    add_structural_subframes_and_crash_beams("SEDAN", wb, 1.880, ride_h, mats, front_y=front_y, rear_y=rear_y)
    add_engine_bay_fluid_systems("SEDAN", front_y, 1.880, ride_h, 0.920, mats)
    add_aerodynamic_wheel_spats_and_shields("SEDAN", wb, 1.880, track_w, ride_h, mats)
    add_cabin_seatbelts_and_door_hardware("SEDAN", wb, 1.880, ride_h, roof_z, mats)
    add_fuel_or_charging_hardware("SEDAN", rear_y, 1.880, ride_h, mats, is_ev=True)
    add_driver_pedal_box("SEDAN", wb, 1.880, ride_h, mats, is_manual=False)
    add_windshield_cowl_and_washer_nozzles("SEDAN", front_y, 1.880, 0.920, mats)
    add_wheel_arch_liners("SEDAN", wb, track_w, ride_h, mats)
    add_inner_door_handles_and_latches("SEDAN", wb, 1.880, ride_h, mats, is_race=False)
    add_underbody_aero_and_heatshields("SEDAN", wb, 1.880, ride_h, mats, is_ev=True, is_race=False)
    add_steering_tie_rods_and_sway_links("SEDAN", wb, track_w, ride_h, mats)
    add_front_wiper_arms_and_aeroblades("SEDAN", front_y, 1.880, 0.920, mats)
    add_active_grille_shutters("SEDAN", front_y, 1.880, ride_h, mats, is_race=False)
    add_cockpit_hvac_vents_and_floor_mats("SEDAN", wb, 1.880, ride_h, mats, is_race=False)
    add_powertrain_electronics_or_exhaust_aftertreatment("SEDAN", wb, 1.880, ride_h, mats, is_ev=True, is_race=False)
    add_high_voltage_inverter_system("SEDAN", wb, ride_h, mats)
    add_electronic_parking_brake_servos("SEDAN", wb, track_w, ride_h, mats)
    add_ultrasonic_park_assist_sensors("SEDAN", front_y, rear_y, 1.880, ride_h, mats)
    add_cockpit_ergonomics_and_door_sills("SEDAN", wb, 1.880, ride_h, mats, is_race=False)
    add_panoramic_sunroof_track_and_sunshade("SEDAN", wb, 1.880, roof_z, mats)
    add_frunk_cargo_basin("SEDAN", wb, 1.880, ride_h, mats)
    add_sedan_executive_advanced_systems(wb, 1.880, ride_h, roof_z, mats)
    add_sedan_luxury_cockpit_and_chassis_amenities(wb, 1.880, ride_h, roof_z, front_y, rear_y, mats)

    # Executive Cockpit & VIP Seating Details
    make_box("SEDAN_Curved_OLED_Instrument_Display", (-0.35, wb*0.18, 0.88), (0.42, 0.02, 0.16), "07_Interior", mats["screen_oled"])
    make_box("SEDAN_Curved_OLED_Infotainment_Touchscreen", (0.05, wb*0.18, 0.86), (0.48, 0.02, 0.22), "07_Interior", mats["screen_oled"])
    make_cylinder("SEDAN_Sport_Steering_Wheel_Rim", (-0.35, wb*0.12, 0.82), 0.18, 0.035, (math.radians(25), 0, 0), "07_Interior", mats["leather_interior"])
    make_box("SEDAN_Console_Rotary_Drive_Selector", (0.0, -wb*0.02, 0.62), (0.16, 0.32, 0.10), "07_Interior", mats["chrome"])

    make_box("SEDAN_Rear_OLED_Display_Driver_Side", (-0.35, -wb*0.08, 0.88), (0.32, 0.02, 0.20), "07_Interior", mats["screen_oled"])
    make_box("SEDAN_Rear_OLED_Display_Pass_Side", (0.35, -wb*0.08, 0.88), (0.32, 0.02, 0.20), "07_Interior", mats["screen_oled"])
    make_box("SEDAN_Rear_VIP_Center_Armrest", (0.0, -wb*0.28, 0.65), (0.24, 0.45, 0.18), "07_Interior", mats["leather_interior"])

    for side, hx in [("FL", -0.95), ("FR", 0.95), ("RL", -0.95), ("RR", 0.95)]:
        hy = wb * 0.20 if "F" in side else -wb * 0.25
        make_box(f"SEDAN_Flush_Door_Handle_{side}", (hx, hy, 0.86), (0.02, 0.18, 0.04), "05_Exterior_Hardware", mats["chrome"])

    make_box("SEDAN_Underbody_Aero_Floor_Pan", (0.0, 0.0, ride_h + 0.04), (1.55, wb * 0.95, 0.02), "02_Bumpers_Aero", mats["carbon"])
    for idx, sx in enumerate([-0.36, -0.12, 0.12, 0.36]):
        make_box(f"SEDAN_Rear_Diffuser_Strake_{idx+1}", (sx, rear_y + 0.08, ride_h + 0.10), (0.02, 0.32, 0.12), "02_Bumpers_Aero", mats["carbon"])

    # High-mount rear brake light (CHMSL)
    make_box("SEDAN_CHMSL_Stop_Lamp", (0.0, rear_y + 0.52, roof_z - 0.04), (0.32, 0.02, 0.015), "04_Lighting", mats["taillight_ruby"])

    refine_all_normals_and_weld()
    export_active_vehicle("sedan", "Car_Sedan_Complete.glb")

def build_hatchback():
    print("\n" + "="*70)
    print(">>> COMPILING PERFORMANCE HOT HATCH (HATCHBACK)")
    print("="*70)
    reset_scene()
    mats = create_global_material_suite()

    src_glb = os.path.join(PROJECT_DIR, "public", "models", "extracted", "ford-escort-rs-cosworth-cossie", "source", "Body_lodA", "Body_lodA", "fordEscortRSCosworth.glb")
    bpy.ops.import_scene.gltf(filepath=src_glb)

    min_c, max_c, dims = calibrate_and_align_to_dimensions(target_len=4.220, target_w=1.800, target_h=1.460, rotate_180_z=True)

    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        n = obj.name.lower()
        if "paint" in n or "coloured" in n:
            assign_to_collection(obj, "01_Body_Main")
            obj.data.materials.clear()
            obj.data.materials.append(mats["paint_hatch"])
        elif "carbon" in n or "grille" in n or "base" in n:
            assign_to_collection(obj, "02_Bumpers_Aero")
            obj.data.materials.clear()
            obj.data.materials.append(mats["carbon"] if "carbon" in n else mats["matte_trim"])
        elif "window" in n:
            assign_to_collection(obj, "03_Glass_Greenhouse")
            obj.data.materials.clear()
            obj.data.materials.append(mats["glass_clear"])
        elif "light" in n:
            assign_to_collection(obj, "04_Lighting")
            obj.data.materials.clear()
            obj.data.materials.append(mats["headlight_led"] if "emissive" in n else mats["taillight_ruby"])
        elif "badge" in n:
            assign_to_collection(obj, "05_Exterior_Hardware")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chrome"])
        elif "mugen" in n or "tire" in n or "tyre" in n or "wheel" in n:
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            obj.data.materials.append(mats["tire_rubber"] if ("tire" in n or "tyre" in n) else mats["wheel_alloy"])
        elif "interior" in n:
            assign_to_collection(obj, "07_Interior")
            obj.data.materials.clear()
            obj.data.materials.append(mats["leather_interior"])
        elif "engine" in n:
            assign_to_collection(obj, "08_Chassis_Powertrain")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chassis_steel"])
        else:
            assign_to_collection(obj, "01_Body_Main")

    wb = 2.600
    ride_h = 0.120
    track_w = 1.540
    front_y = max_c.y
    rear_y = min_c.y
    roof_z = 1.250  # Paint_Geo_lodA roof envelope (spoiler reaches 1.46m)

    add_full_suspension_system("HATCH", wb, track_w, ride_h, mats, spring_key="spring_yellow", caliper_key="brake_caliper")
    add_wheel_fasteners_and_valves("HATCH", wb, track_w, ride_h, mats, is_centerlock=False)
    add_front_cooling_module("HATCH", front_y, 1.800, ride_h, mats, is_race=True)
    add_sensor_and_adas_suite("HATCH", front_y, rear_y, 1.800, ride_h, 0.940, mats)
    add_cabin_controls_and_mirror("HATCH", wb, 1.800, ride_h, roof_z, mats, is_race=True)
    add_exterior_hardware_accessories("HATCH", front_y, rear_y, 0.940, roof_z, 1.800, mats)
    add_structural_subframes_and_crash_beams("HATCH", wb, 1.800, ride_h, mats, front_y=front_y, rear_y=rear_y)
    add_engine_bay_fluid_systems("HATCH", front_y, 1.800, ride_h, 0.940, mats)
    add_aerodynamic_wheel_spats_and_shields("HATCH", wb, 1.800, track_w, ride_h, mats)
    add_cabin_seatbelts_and_door_hardware("HATCH", wb, 1.800, ride_h, roof_z, mats, is_race=True)
    add_fuel_or_charging_hardware("HATCH", rear_y, 1.800, ride_h, mats, is_ev=False)
    add_driver_pedal_box("HATCH", wb, 1.800, ride_h, mats, is_manual=True)
    add_windshield_cowl_and_washer_nozzles("HATCH", front_y, 1.800, 0.940, mats)
    add_wheel_arch_liners("HATCH", wb, track_w, ride_h, mats)
    add_inner_door_handles_and_latches("HATCH", wb, 1.800, ride_h, mats, is_race=False)
    add_underbody_aero_and_heatshields("HATCH", wb, 1.800, ride_h, mats, is_ev=False, is_race=False)
    add_steering_tie_rods_and_sway_links("HATCH", wb, track_w, ride_h, mats)
    add_front_wiper_arms_and_aeroblades("HATCH", front_y, 1.800, 0.940, mats)
    add_active_grille_shutters("HATCH", front_y, 1.800, ride_h, mats, is_race=False)
    add_cockpit_hvac_vents_and_floor_mats("HATCH", wb, 1.800, ride_h, mats, is_race=False)
    add_powertrain_electronics_or_exhaust_aftertreatment("HATCH", wb, 1.800, ride_h, mats, is_ev=False, is_race=False)
    add_rally_hatch_competition_systems(front_y, rear_y, wb, 1.800, ride_h, roof_z, mats)
    add_rally_hatch_chassis_and_fuel_systems(front_y, rear_y, wb, 1.800, ride_h, mats)
    add_rally_hatch_competition_powertrain_and_aero(front_y, rear_y, wb, 1.800, ride_h, roof_z, mats)
    add_cockpit_ergonomics_and_door_sills("HATCH", wb, 1.800, ride_h, mats, is_race=True)

    # FIA Rally Roll Cage (Tucked safely inside cabin envelope below headliner)
    cage_top_z = 1.150
    make_cylinder("HATCH_RollCage_MainHoop_Top", (0.0, -0.05, cage_top_z), 0.022, 1.15, (0, math.radians(90), 0), "07_Interior", mats["roll_cage_blue"])
    make_cylinder("HATCH_RollCage_MainHoop_L", (-0.56, -0.05, (cage_top_z + ride_h + 0.12)/2.0), 0.022, cage_top_z - ride_h - 0.12, (0, 0, 0), "07_Interior", mats["roll_cage_blue"])
    make_cylinder("HATCH_RollCage_MainHoop_R", (0.56, -0.05, (cage_top_z + ride_h + 0.12)/2.0), 0.022, cage_top_z - ride_h - 0.12, (0, 0, 0), "07_Interior", mats["roll_cage_blue"])
    make_cylinder("HATCH_RollCage_RearStay_L", (-0.54, -0.65, (cage_top_z + ride_h + 0.18)/2.0), 0.020, 0.92, (math.radians(-38), 0, 0), "07_Interior", mats["roll_cage_blue"])
    make_cylinder("HATCH_RollCage_RearStay_R", (0.54, -0.65, (cage_top_z + ride_h + 0.18)/2.0), 0.020, 0.92, (math.radians(-38), 0, 0), "07_Interior", mats["roll_cage_blue"])

    # Rally Recaro Bucket Seats & Sabelt Harnesses
    for seat_side, sx in [("Driver", -0.36), ("Codriver", 0.36)]:
        make_box(f"HATCH_Recaro_Seat_{seat_side}_Cushion", (sx, 0.05, 0.45), (0.46, 0.48, 0.14), "07_Interior", mats["leather_interior"])
        make_box(f"HATCH_Recaro_Seat_{seat_side}_Backrest", (sx, -0.18, 0.82), (0.44, 0.12, 0.62), "07_Interior", mats["leather_interior"])
        make_box(f"HATCH_Sabelt_Harness_{seat_side}_L", (sx - 0.10, -0.10, 0.80), (0.06, 0.22, 0.50), "07_Interior", mats["harness_red"])
        make_box(f"HATCH_Sabelt_Harness_{seat_side}_R", (sx + 0.10, -0.10, 0.80), (0.06, 0.22, 0.50), "07_Interior", mats["harness_red"])

    # Suede Rally Wheel, Sequential Shifter, Hydraulic E-Brake, Terratrip Computer
    make_cylinder("HATCH_Rally_Steering_Wheel", (-0.36, wb*0.14, 0.86), 0.175, 0.035, (math.radians(28), 0, 0), "07_Interior", mats["matte_trim"])
    make_cylinder("HATCH_Sequential_Rally_Shifter", (-0.08, 0.12, 0.68), 0.016, 0.28, (0, 0, 0), "07_Interior", mats["skid_silver"])
    make_cylinder("HATCH_Hydraulic_Handbrake_Lever", (0.08, 0.06, 0.72), 0.016, 0.32, (math.radians(-15), 0, 0), "07_Interior", mats["skid_silver"])
    make_box("HATCH_Terratrip_Rally_Computer", (0.36, wb*0.18, 0.88), (0.18, 0.06, 0.12), "07_Interior", mats["screen_oled"])

    # Turbocharged 2.0L 16V Engine Bay
    make_box("HATCH_Engine_Block_2.0L_Turbo", (0.0, wb/2.0 + 0.16, 0.50), (0.52, 0.44, 0.38), "08_Chassis_Powertrain", mats["chassis_steel"])
    make_box("HATCH_Valve_Cover_Cosworth", (0.0, wb/2.0 + 0.16, 0.70), (0.48, 0.38, 0.08), "08_Chassis_Powertrain", mats["paint_gt3"])
    make_cylinder("HATCH_Turbocharger_Turbine", (0.30, wb/2.0 + 0.22, 0.52), 0.075, 0.12, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["titanium"])
    make_cylinder("HATCH_Charge_Piping_Silicone", (-0.22, wb/2.0 + 0.32, 0.58), 0.035, 0.40, (math.radians(40), 0, 0), "08_Chassis_Powertrain", mats["silicone_red"])
    make_cylinder("HATCH_Strut_Tower_Brace", (0.0, wb/2.0 - 0.02, 0.72), 0.018, 1.25, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["skid_silver"])

    # Flush Rally Roof Scoop & Aerodynamics
    make_box("HATCH_Rally_Roof_Ventilation_Scoop", (0.0, 0.25, roof_z + 0.025), (0.32, 0.28, 0.045), "02_Bumpers_Aero", mats["paint_hatch"])
    make_box("HATCH_Rally_Intercooler", (0.0, front_y - 0.12, 0.26), (0.64, 0.08, 0.20), "02_Bumpers_Aero", mats["skid_silver"])
    for lp_x in [-0.28, -0.09, 0.09, 0.28]:
        make_cylinder(f"HATCH_Rally_Pod_Spotlight_X{int(lp_x*100)}", (lp_x, front_y - 0.06, 0.58), 0.065, 0.06, (math.radians(90), 0, 0), "04_Lighting", mats["headlight_led"])
    for flap_pos, fx, fy in [("FL", -0.78, wb/2.0 - 0.26), ("FR", 0.78, wb/2.0 - 0.26), ("RL", -0.78, -wb/2.0 - 0.26), ("RR", 0.78, -wb/2.0 - 0.26)]:
        make_box(f"HATCH_MudFlap_{flap_pos}", (fx, fy, 0.14), (0.02, 0.20, 0.20), "05_Exterior_Hardware", mats["matte_trim"])
    make_cylinder("HATCH_Sport_Exhaust_Tip", (-0.38, rear_y - 0.02, 0.26), 0.048, 0.25, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["chrome"])
    make_box("HATCH_Tailgate_Rear_Wiper", (0.0, rear_y + 0.12, 1.05), (0.35, 0.02, 0.02), "05_Exterior_Hardware", mats["matte_trim"])

    refine_all_normals_and_weld()
    export_active_vehicle("hatchback", "Car_Hatchback_Complete.glb")

def build_crossover():
    print("\n" + "="*70)
    print(">>> COMPILING URBAN CROSSOVER AWD (CROSSOVER)")
    print("="*70)
    reset_scene()
    mats = create_global_material_suite()

    src_fbx = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")
    bpy.ops.import_scene.fbx(filepath=src_fbx)

    min_c, max_c, dims = calibrate_and_align_to_dimensions(target_len=4.540, target_w=1.880, target_h=1.620, rotate_180_z=True)

    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        n = obj.name.lower()
        if any(k in n for k in ["bodypaint", "corner", "cavity", "mr_paint"]):
            assign_to_collection(obj, "01_Body_Main")
            obj.data.materials.clear()
            obj.data.materials.append(mats["paint_crossover"])
        elif any(k in n for k in ["blk", "grill", "mudflaps", "uc"]):
            assign_to_collection(obj, "02_Bumpers_Aero")
            obj.data.materials.clear()
            obj.data.materials.append(mats["matte_trim"])
        elif any(k in n for k in ["glass", "windshield", "defogger"]):
            assign_to_collection(obj, "03_Glass_Greenhouse")
            obj.data.materials.clear()
            obj.data.materials.append(mats["glass_tint"] if "roof" in n else mats["glass_clear"])
        elif any(k in n for k in ["hl", "dhl", "break_light", "light", "lamp", "indicator"]):
            assign_to_collection(obj, "04_Lighting")
            obj.data.materials.clear()
            obj.data.materials.append(mats["headlight_led"] if "hl" in n else mats["taillight_ruby"])
        elif any(k in n for k in ["badge", "crme", "crome", "antenna", "cam", "bolt", "byd"]):
            assign_to_collection(obj, "05_Exterior_Hardware")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chrome"])
        elif any(k in n for k in ["caliper", "disk", "wheel", "rim", "tire", "tyre"]):
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            if "tire" in n or "tyre" in n:
                obj.data.materials.append(mats["tire_rubber"])
            elif "caliper" in n:
                obj.data.materials.append(mats["caliper_gold"])
            else:
                obj.data.materials.append(mats["wheel_dark"])
        elif any(k in n for k in ["interior", "seat"]):
            assign_to_collection(obj, "07_Interior")
            obj.data.materials.clear()
            obj.data.materials.append(mats["leather_interior"])
        else:
            assign_to_collection(obj, "01_Body_Main")

    wb = 2.700
    ride_h = 0.190
    track_w = 1.600
    front_y = max_c.y
    rear_y = min_c.y
    roof_z = 1.585

    add_full_suspension_system("CROSSOVER", wb, track_w, ride_h, mats, spring_key="spring_green", caliper_key="caliper_gold")
    add_wheel_fasteners_and_valves("CROSSOVER", wb, track_w, ride_h, mats, is_centerlock=False)
    add_ev_skateboard_powertrain("CROSSOVER", wb, 1.880, ride_h, mats)
    add_front_cooling_module("CROSSOVER", front_y, 1.880, ride_h, mats)
    add_sensor_and_adas_suite("CROSSOVER", front_y, rear_y, 1.880, ride_h, 1.080, mats)
    add_cabin_controls_and_mirror("CROSSOVER", wb, 1.880, ride_h, roof_z, mats)
    add_exterior_hardware_accessories("CROSSOVER", front_y, rear_y, 1.080, roof_z, 1.880, mats)
    add_structural_subframes_and_crash_beams("CROSSOVER", wb, 1.880, ride_h, mats, front_y=front_y, rear_y=rear_y)
    add_engine_bay_fluid_systems("CROSSOVER", front_y, 1.880, ride_h, 1.080, mats)
    add_aerodynamic_wheel_spats_and_shields("CROSSOVER", wb, 1.880, track_w, ride_h, mats)
    add_cabin_seatbelts_and_door_hardware("CROSSOVER", wb, 1.880, ride_h, roof_z, mats)
    add_fuel_or_charging_hardware("CROSSOVER", rear_y, 1.880, ride_h, mats, is_ev=True)
    add_driver_pedal_box("CROSSOVER", wb, 1.880, ride_h, mats, is_manual=False)
    add_windshield_cowl_and_washer_nozzles("CROSSOVER", front_y, 1.880, 1.080, mats)
    add_wheel_arch_liners("CROSSOVER", wb, track_w, ride_h, mats)
    add_inner_door_handles_and_latches("CROSSOVER", wb, 1.880, ride_h, mats, is_race=False)
    add_underbody_aero_and_heatshields("CROSSOVER", wb, 1.880, ride_h, mats, is_ev=True, is_race=False)
    add_steering_tie_rods_and_sway_links("CROSSOVER", wb, track_w, ride_h, mats)
    add_front_wiper_arms_and_aeroblades("CROSSOVER", front_y, 1.880, 1.080, mats)
    add_active_grille_shutters("CROSSOVER", front_y, 1.880, ride_h, mats, is_race=False)
    add_cockpit_hvac_vents_and_floor_mats("CROSSOVER", wb, 1.880, ride_h, mats, is_race=False)
    add_powertrain_electronics_or_exhaust_aftertreatment("CROSSOVER", wb, 1.880, ride_h, mats, is_ev=True, is_race=False)
    add_high_voltage_inverter_system("CROSSOVER", wb, ride_h, mats)
    add_electronic_parking_brake_servos("CROSSOVER", wb, track_w, ride_h, mats)
    add_ultrasonic_park_assist_sensors("CROSSOVER", front_y, rear_y, 1.880, ride_h, mats)
    add_cockpit_ergonomics_and_door_sills("CROSSOVER", wb, 1.880, ride_h, mats, is_race=False)
    add_panoramic_sunroof_track_and_sunshade("CROSSOVER", wb, 1.880, roof_z, mats)
    add_frunk_cargo_basin("CROSSOVER", wb, 1.880, ride_h, mats)
    add_crossover_adventure_pack(front_y, rear_y, wb, 1.880, roof_z, ride_h, mats)
    add_crossover_overland_adventure_hardware(front_y, rear_y, wb, 1.880, roof_z, ride_h, mats)
    add_crossover_expedition_powertrain_and_utility(front_y, rear_y, wb, 1.880, roof_z, ride_h, mats)

    # Snug Adventure Roof Rails & Crossbars (Seated tightly on roof contours)
    rail_z = roof_z + 0.020
    for side in [-1, 1]:
        make_box(f"CROSSOVER_Roof_Rail_{'L' if side > 0 else 'R'}", (side * 0.58, 0.0, rail_z), (0.035, 1.85, 0.035), "02_Bumpers_Aero", mats["skid_silver"])
    make_box("CROSSOVER_Roof_Cargo_Crossbar_Front", (0.0, 0.40, rail_z + 0.025), (1.16, 0.05, 0.025), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("CROSSOVER_Roof_Cargo_Crossbar_Rear", (0.0, -0.45, rail_z + 0.025), (1.16, 0.05, 0.025), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("CROSSOVER_Roof_LED_LightBar_40Inch", (0.0, 0.45, rail_z + 0.035), (0.90, 0.05, 0.03), "04_Lighting", mats["headlight_led"])

    # Front & Rear Protective Skid Plates
    make_box("CROSSOVER_Front_Skid_Plate", (0.0, front_y - 0.08, 0.22), (0.82, 0.20, 0.03), "02_Bumpers_Aero", mats["skid_silver"])
    make_box("CROSSOVER_Rear_Skid_Plate", (0.0, rear_y + 0.08, 0.26), (0.84, 0.22, 0.03), "02_Bumpers_Aero", mats["skid_silver"])
    make_box("CROSSOVER_Rear_Tow_Hitch_Receiver", (0.0, rear_y - 0.02, 0.26), (0.12, 0.12, 0.12), "05_Exterior_Hardware", mats["chassis_steel"])
    make_cylinder("CROSSOVER_Recovery_D_Ring", (0.0, rear_y - 0.06, 0.25), 0.030, 0.02, (math.radians(90), 0, 0), "05_Exterior_Hardware", mats["spring_red"])

    # Rear Tailgate Wiper and Reverse Reflector Blocks
    make_box("CROSSOVER_Tailgate_Rear_Wiper", (0.0, rear_y + 0.10, 1.18), (0.34, 0.02, 0.02), "05_Exterior_Hardware", mats["matte_trim"])
    make_box("CROSSOVER_Rear_Reflector_L", (-0.72, rear_y + 0.04, 0.42), (0.14, 0.02, 0.04), "04_Lighting", mats["taillight_ruby"])
    make_box("CROSSOVER_Rear_Reflector_R", (0.72, rear_y + 0.04, 0.42), (0.14, 0.02, 0.04), "04_Lighting", mats["taillight_ruby"])

    refine_all_normals_and_weld()
    export_active_vehicle("crossover", "Car_Crossover_Complete.glb")

def build_suv():
    print("\n" + "="*70)
    print(">>> COMPILING FULL-SIZE HEAVY DUTY SUV (SUV)")
    print("="*70)
    reset_scene()
    mats = create_global_material_suite()

    blend_path = os.path.join(PROJECT_DIR, "public", "models", "extracted", "32-mercedes-benz-gls-580-2020", "uploads_files_2787791_Mercedes+Benz+GLS+580.blend")
    with bpy.data.libraries.load(blend_path) as (data_from, data_to):
        data_to.objects = [name for name in data_from.objects if "mercedes" in name.lower() or "gls" in name.lower()]

    for obj in data_to.objects:
        if obj:
            bpy.context.scene.collection.objects.link(obj)

    gls = bpy.data.objects.get("Mercedes Benz GLS 580")
    if not gls:
        gls = [o for o in bpy.data.objects if o.type == 'MESH'][0]

    bpy.ops.object.select_all(action='DESELECT')
    gls.select_set(True)
    bpy.context.view_layer.objects.active = gls
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.separate(type='MATERIAL')
    bpy.ops.object.mode_set(mode='OBJECT')

    min_c, max_c, dims = calibrate_and_align_to_dimensions(target_len=5.080, target_w=2.000, target_h=1.820, rotate_180_z=True)

    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        m_name = obj.material_slots[0].name.lower() if obj.material_slots else ""
        if "polar" in m_name or "color_a" in m_name:
            assign_to_collection(obj, "01_Body_Main")
            obj.data.materials.clear()
            obj.data.materials.append(mats["paint_suv"])
        elif "grille" in m_name or "chromeblack" in m_name:
            assign_to_collection(obj, "02_Bumpers_Aero")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chrome"] if "grille" in m_name else mats["gloss_black"])
        elif "window" in m_name:
            assign_to_collection(obj, "03_Glass_Greenhouse")
            obj.data.materials.clear()
            obj.data.materials.append(mats["glass_tint"])
        elif "light" in m_name:
            assign_to_collection(obj, "04_Lighting")
            obj.data.materials.clear()
            obj.data.materials.append(mats["headlight_led"])
        elif "tyre" in m_name or "tire" in m_name:
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            obj.data.materials.append(mats["tire_rubber"])
        elif "color_m" in m_name:
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            obj.data.materials.append(mats["wheel_alloy"])
        elif "interior" in m_name:
            assign_to_collection(obj, "07_Interior")
            obj.data.materials.clear()
            obj.data.materials.append(mats["leather_interior"])
        elif "undercarriage" in m_name:
            assign_to_collection(obj, "08_Chassis_Powertrain")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chassis_steel"])
        else:
            assign_to_collection(obj, "01_Body_Main")

    wb = 2.980
    ride_h = 0.230
    track_w = 1.700
    front_y = max_c.y
    rear_y = min_c.y
    roof_z = 1.735

    add_full_suspension_system("SUV", wb, track_w, ride_h, mats, spring_key="air_spring", caliper_key="caliper_silver")
    add_wheel_fasteners_and_valves("SUV", wb, track_w, ride_h, mats, is_centerlock=False)
    add_front_cooling_module("SUV", front_y, 2.000, ride_h, mats)
    add_sensor_and_adas_suite("SUV", front_y, rear_y, 2.000, ride_h, 1.220, mats)
    add_cabin_controls_and_mirror("SUV", wb, 2.000, ride_h, roof_z, mats)
    add_exterior_hardware_accessories("SUV", front_y, rear_y, 1.220, roof_z, 2.000, mats)
    add_structural_subframes_and_crash_beams("SUV", wb, 2.000, ride_h, mats, front_y=front_y, rear_y=rear_y)
    add_engine_bay_fluid_systems("SUV", front_y, 2.000, ride_h, 1.220, mats)
    add_aerodynamic_wheel_spats_and_shields("SUV", wb, 2.000, track_w, ride_h, mats)
    add_cabin_seatbelts_and_door_hardware("SUV", wb, 2.000, ride_h, roof_z, mats)
    add_fuel_or_charging_hardware("SUV", rear_y, 2.000, ride_h, mats, is_ev=False)
    add_driver_pedal_box("SUV", wb, 2.000, ride_h, mats, is_manual=False)
    add_windshield_cowl_and_washer_nozzles("SUV", front_y, 2.000, 1.220, mats)
    add_wheel_arch_liners("SUV", wb, track_w, ride_h, mats)
    add_inner_door_handles_and_latches("SUV", wb, 2.000, ride_h, mats, is_race=False)
    add_underbody_aero_and_heatshields("SUV", wb, 2.000, ride_h, mats, is_ev=False, is_race=False)
    add_steering_tie_rods_and_sway_links("SUV", wb, track_w, ride_h, mats)
    add_front_wiper_arms_and_aeroblades("SUV", front_y, 2.000, 1.220, mats)
    add_active_grille_shutters("SUV", front_y, 2.000, ride_h, mats, is_race=False)
    add_cockpit_hvac_vents_and_floor_mats("SUV", wb, 2.000, ride_h, mats, is_race=False)
    add_powertrain_electronics_or_exhaust_aftertreatment("SUV", wb, 2.000, ride_h, mats, is_ev=False, is_race=False)
    add_suv_heavy_duty_systems(wb, track_w, front_y, rear_y, ride_h, mats)
    add_electronic_parking_brake_servos("SUV", wb, track_w, ride_h, mats)
    add_ultrasonic_park_assist_sensors("SUV", front_y, rear_y, 2.000, ride_h, mats)
    add_cockpit_ergonomics_and_door_sills("SUV", wb, 2.000, ride_h, mats, is_race=False)
    add_panoramic_sunroof_track_and_sunshade("SUV", wb, 2.000, roof_z, mats)
    add_suv_heavy_duty_powertrain_and_chassis_details(front_y, rear_y, wb, 2.000, ride_h, mats)
    add_suv_v8_twin_turbo_and_executive_suite(front_y, rear_y, wb, 2.000, ride_h, roof_z, mats)

    # Longitudinal 4.0L V8 Biturbo Powertrain & Driveshaft
    make_box("SUV_V8_Biturbo_Engine_Block", (0.0, wb/2.0 + 0.12, 0.72), (0.68, 0.62, 0.48), "08_Chassis_Powertrain", mats["chassis_steel"])
    for t_side, tx in [("L", -0.14), ("R", 0.14)]:
        make_cylinder(f"SUV_Twin_Scroll_Turbo_{t_side}", (tx, wb/2.0 + 0.18, 0.94), 0.065, 0.12, (0, math.radians(90), 0), "08_Chassis_Powertrain", mats["titanium"])
    make_cylinder("SUV_Center_Driveshaft_Prop", (0.0, 0.0, ride_h + 0.14), 0.035, wb * 0.85, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["chassis_steel"])

    # 3-Row VIP Cabin & Curved MBUX Hyperscreen
    make_box("SUV_MBUX_Curved_Hyperscreen_Dash", (0.0, wb*0.22, 1.12), (1.28, 0.05, 0.24), "07_Interior", mats["screen_oled"])
    make_cylinder("SUV_Multifunction_Wood_Steering_Wheel", (-0.42, wb*0.14, 1.08), 0.19, 0.04, (math.radians(24), 0, 0), "07_Interior", mats["leather_beige"])
    make_box("SUV_2ndRow_Captain_Chair_L", (-0.42, -wb*0.12, 0.85), (0.52, 0.52, 0.65), "07_Interior", mats["leather_beige"])
    make_box("SUV_2ndRow_Captain_Chair_R", (0.42, -wb*0.12, 0.85), (0.52, 0.52, 0.65), "07_Interior", mats["leather_beige"])
    make_box("SUV_3rdRow_FoldFlat_Bench", (0.0, -wb*0.38, 0.82), (1.18, 0.48, 0.58), "07_Interior", mats["leather_beige"])

    # Integrated Bumper Step
    make_box("SUV_Split_Tailgate_Step_Pad", (0.0, rear_y + 0.04, 0.58), (1.05, 0.10, 0.03), "05_Exterior_Hardware", mats["skid_silver"])

    refine_all_normals_and_weld()
    export_active_vehicle("suv", "Car_SUV_Complete.glb")

def build_gt3_supercar():
    print("\n" + "="*70)
    print(">>> COMPILING APEX GT3 RACING SUPERCAR (GT3_SUPERCAR)")
    print("="*70)
    reset_scene()
    mats = create_global_material_suite()

    src_glb = os.path.join(PROJECT_DIR, "public", "models", "extracted", "bmw-i8-xs-2015", "source", "2015-bmw-i8_xs_car.glb")
    bpy.ops.import_scene.gltf(filepath=src_glb)

    for obj in list(bpy.data.objects):
        if "icosphere" in obj.name.lower() or "bounding" in obj.name.lower():
            bpy.data.objects.remove(obj, do_unlink=True)

    min_c, max_c, dims = calibrate_and_align_to_dimensions(target_len=4.650, target_w=2.040, target_h=1.150, rotate_180_z=True)

    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        n = obj.name.lower()
        if "paint" in n or "coloured" in n:
            assign_to_collection(obj, "01_Body_Main")
            obj.data.materials.clear()
            obj.data.materials.append(mats["paint_gt3"])
        elif "carbon" in n or "grille" in n:
            assign_to_collection(obj, "02_Bumpers_Aero")
            obj.data.materials.clear()
            obj.data.materials.append(mats["carbon"])
        elif "window" in n:
            assign_to_collection(obj, "03_Glass_Greenhouse")
            obj.data.materials.clear()
            obj.data.materials.append(mats["glass_clear"])
        elif "light" in n:
            assign_to_collection(obj, "04_Lighting")
            obj.data.materials.clear()
            obj.data.materials.append(mats["headlight_led"] if "lighta" in n else mats["taillight_ruby"])
        elif "plate" in n or "badge" in n:
            assign_to_collection(obj, "05_Exterior_Hardware")
            obj.data.materials.clear()
            obj.data.materials.append(mats["chrome"])
        elif "wheel" in n or "tire" in n or "calliper" in n or "polysurface" in n:
            assign_to_collection(obj, "06_Running_Gear")
            obj.data.materials.clear()
            if "calliper" in n:
                obj.data.materials.append(mats["caliper_acid_yellow"])
            elif "tire" in n:
                obj.data.materials.append(mats["tire_rubber"])
            else:
                obj.data.materials.append(mats["wheel_dark"])
        elif "interior" in n or "seat" in n:
            assign_to_collection(obj, "07_Interior")
            obj.data.materials.clear()
            obj.data.materials.append(mats["carbon"])
        elif "engine" in n or "base" in n:
            assign_to_collection(obj, "08_Chassis_Powertrain")
            obj.data.materials.clear()
            obj.data.materials.append(mats["carbon"] if "base" in n else mats["chassis_steel"])
        else:
            assign_to_collection(obj, "01_Body_Main")

    wb = 2.720
    ride_h = 0.065
    track_w = 1.740
    front_y = max_c.y
    rear_y = min_c.y
    roof_z = 1.145

    add_full_suspension_system("GT3", wb, track_w, ride_h, mats, spring_key="spring_yellow", caliper_key="caliper_acid_yellow")
    add_wheel_fasteners_and_valves("GT3", wb, track_w, ride_h, mats, is_centerlock=True)
    add_front_cooling_module("GT3", front_y, 2.040, ride_h, mats, is_race=True)
    add_sensor_and_adas_suite("GT3", front_y, rear_y, 2.040, ride_h, 0.680, mats)
    add_cabin_controls_and_mirror("GT3", wb, 2.040, ride_h, roof_z, mats, is_race=True)
    add_exterior_hardware_accessories("GT3", front_y, rear_y, 0.680, roof_z, 2.040, mats)
    add_structural_subframes_and_crash_beams("GT3", wb, 2.040, ride_h, mats, front_y=front_y, rear_y=rear_y)
    add_engine_bay_fluid_systems("GT3", front_y, 2.040, ride_h, 0.680, mats)
    add_aerodynamic_wheel_spats_and_shields("GT3", wb, 2.040, track_w, ride_h, mats)
    add_cabin_seatbelts_and_door_hardware("GT3", wb, 2.040, ride_h, roof_z, mats, is_race=True)
    add_fuel_or_charging_hardware("GT3", rear_y, 2.040, ride_h, mats, is_ev=False)
    add_driver_pedal_box("GT3", wb, 2.040, ride_h, mats, is_manual=False)
    add_windshield_cowl_and_washer_nozzles("GT3", front_y, 2.040, 0.680, mats)
    add_wheel_arch_liners("GT3", wb, track_w, ride_h, mats)
    add_inner_door_handles_and_latches("GT3", wb, 2.040, ride_h, mats, is_race=True)
    add_underbody_aero_and_heatshields("GT3", wb, 2.040, ride_h, mats, is_ev=False, is_race=True)
    add_steering_tie_rods_and_sway_links("GT3", wb, track_w, ride_h, mats)
    add_front_wiper_arms_and_aeroblades("GT3", front_y, 2.040, 0.680, mats)
    add_active_grille_shutters("GT3", front_y, 2.040, ride_h, mats, is_race=True)
    add_cockpit_hvac_vents_and_floor_mats("GT3", wb, 2.040, ride_h, mats, is_race=True)
    add_powertrain_electronics_or_exhaust_aftertreatment("GT3", wb, 2.040, ride_h, mats, is_ev=False, is_race=True)
    add_gt3_competition_systems(front_y, rear_y, wb, 2.040, ride_h, roof_z, roof_z + 0.04, mats)
    add_cockpit_ergonomics_and_door_sills("GT3", wb, 2.040, ride_h, mats, is_race=True)
    add_gt3_aerospace_and_cockpit_racing_gear(front_y, rear_y, wb, 2.040, ride_h, roof_z, mats)
    add_gt3_advanced_motorsport_systems(front_y, rear_y, wb, 2.040, ride_h, roof_z, mats)

    # Front Carbon Racing Splitter & Stainless Tension Rods
    make_box("GT3_Front_Carbon_Racing_Splitter", (0.0, front_y + 0.01, ride_h + 0.02), (1.92, 0.32, 0.022), "02_Bumpers_Aero", mats["carbon"])
    for s_side, sx in [("L", -0.32), ("R", 0.32)]:
        make_cylinder(f"GT3_Splitter_Tension_Rod_{s_side}", (sx, front_y - 0.06, ride_h + 0.12), 0.008, 0.22, (math.radians(-30), 0, 0), "02_Bumpers_Aero", mats["chrome"])
        make_box(f"GT3_DivePlane_Upper_{s_side}", (sx * 2.8, front_y - 0.28, ride_h + 0.28), (0.24, 0.14, 0.015), "02_Bumpers_Aero", mats["carbon"])
        make_box(f"GT3_DivePlane_Lower_{s_side}", (sx * 2.8, front_y - 0.22, ride_h + 0.16), (0.26, 0.16, 0.015), "02_Bumpers_Aero", mats["carbon"])

    # Competition Aerodynamics: Swan-Neck Carbon Wing & Endplates
    wing_z = roof_z + 0.04
    make_box("GT3_SwanNeck_Carbon_Wing", (0.0, rear_y - 0.06, wing_z), (1.86, 0.38, 0.03), "02_Bumpers_Aero", mats["carbon"])
    for px in [-0.42, 0.42]:
        make_box(f"GT3_Wing_Pylon_X{int(px*100)}", (px, rear_y - 0.02, wing_z - 0.12), (0.025, 0.16, 0.26), "02_Bumpers_Aero", mats["carbon"])
    make_box("GT3_Wing_Endplate_L", (-0.96, rear_y - 0.08, wing_z), (0.015, 0.45, 0.24), "02_Bumpers_Aero", mats["carbon"])
    make_box("GT3_Wing_Endplate_R", (0.96, rear_y - 0.08, wing_z), (0.015, 0.45, 0.24), "02_Bumpers_Aero", mats["carbon"])

    # Rear Competition 6-Strake Venturi Diffuser
    for d_idx, dx in enumerate([-0.50, -0.30, -0.10, 0.10, 0.30, 0.50]):
        make_box(f"GT3_Venturi_Diffuser_Strake_{d_idx+1}", (dx, rear_y + 0.04, ride_h + 0.10), (0.02, 0.38, 0.16), "02_Bumpers_Aero", mats["carbon"])

    # Dual Center-Exit Flame-Tinted Titanium Exhaust Pipes
    for ex_side, ex_name in [(-0.09, "L"), (0.09, "R")]:
        make_cylinder(f"GT3_Titanium_Exhaust_{ex_name}", (ex_side, rear_y - 0.02, 0.32), 0.052, 0.30, (math.radians(90), 0, 0), "08_Chassis_Powertrain", mats["titanium"])

    # FIA GT3 Tubular Roll Cage & Carbon Telemetry Yoke
    make_cylinder("GT3_RollCage_MainHoop", (0.0, -0.05, roof_z - 0.10), 0.022, 1.45, (0, math.radians(90), 0), "07_Interior", mats["matte_trim"])
    make_box("GT3_Carbon_Yoke_Steering_Wheel", (-0.38, wb*0.14, 0.72), (0.28, 0.03, 0.16), "07_Interior", mats["carbon"])
    make_box("GT3_Telemetry_OLED_Screen", (-0.38, wb*0.14, 0.72), (0.14, 0.032, 0.08), "07_Interior", mats["screen_oled"])
    make_box("GT3_Carbon_Racing_Seat_Shell", (-0.38, -0.12, 0.65), (0.48, 0.52, 0.68), "07_Interior", mats["carbon"])
    make_cylinder("GT3_Fire_Suppression_Bottle", (0.08, -0.05, 0.35), 0.065, 0.28, (math.radians(90), 0, 0), "07_Interior", mats["spring_red"])

    # 4-Corner Pneumatic Pit-Stop Air Jack Lifting Pistons Under Chassis
    for j_corner, jx, jy in [("FL", -0.72, wb*0.38), ("FR", 0.72, wb*0.38), ("RL", -0.72, -wb*0.38), ("RR", 0.72, -wb*0.38)]:
        make_cylinder(f"GT3_Air_Jack_Cylinder_{j_corner}", (jx, jy, ride_h + 0.06), 0.030, 0.16, (0, 0, 0), "08_Chassis_Powertrain", mats["titanium"])

    # Front & Rear Red Nylon Tow Straps
    make_box("GT3_Tow_Strap_Front", (0.45, front_y - 0.02, ride_h + 0.22), (0.04, 0.18, 0.008), "05_Exterior_Hardware", mats["nylon_tow_red"])
    make_box("GT3_Tow_Strap_Rear", (-0.45, rear_y + 0.02, ride_h + 0.25), (0.04, 0.18, 0.008), "05_Exterior_Hardware", mats["nylon_tow_red"])

    refine_all_normals_and_weld()
    export_active_vehicle("gt3_supercar", "Car_GT3_Supercar_Complete.glb")

# ----------------------------------------------------------------------------
# 6. MASTER COMPILER ORCHESTRATION
# ----------------------------------------------------------------------------
def main():
    target_cat = None
    for idx, arg in enumerate(sys.argv):
        if arg == "--category" and idx + 1 < len(sys.argv):
            target_cat = sys.argv[idx + 1].lower()

    print("=" * 80)
    print(f"STARTING FLEET COMPILATION & PACKAGING (Target: {target_cat.upper() if target_cat else 'ALL 5'})")
    print("=" * 80)

    builders = {
        "sedan": build_sedan,
        "hatchback": build_hatchback,
        "crossover": build_crossover,
        "suv": build_suv,
        "gt3_supercar": build_gt3_supercar,
    }

    if target_cat and target_cat in builders:
        builders[target_cat]()
    else:
        for name, fn in builders.items():
            fn()

    print("\n" + "=" * 80)
    print("FLEET COMPILATION, REFINEMENT, AND PACKAGING COMPLETED!")
    print("=" * 80)

if __name__ == "__main__":
    main()
