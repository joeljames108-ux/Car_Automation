"""
==============================================================================
AUTOMOTIVE MASTER FLEET PIPELINE: ALL VEHICLE PLATFORMS & SUBASSEMBLIES
==============================================================================
Procedurally constructs, shades, welds, and exports complete modular 3D vehicles
across all 5 core automotive categories:
1. Executive Sport Sedan       ('sedan')
2. Performance Hot Hatch       ('hatchback')
3. Urban Crossover AWD         ('crossover')
4. Full-Size Heavy Duty SUV    ('suv')
5. Apex GT3 Racing Supercar    ('gt3_supercar')

Every vehicle includes all 8 standardized production collections:
  01_Body_Main, 02_Bumpers_Aero, 03_Glass_Greenhouse, 04_Lighting,
  05_Exterior_Hardware, 06_Running_Gear, 07_Interior, 08_Chassis_Powertrain

Standards:
- Zero-offset snapping world coordinates (Y-Forward, Z-Up, X-Lateral)
- Welded vertices (0.5mm threshold) & smooth outward normals
- Physical Principled BSDF PBR material factory with clearcoat & transmission
- Dual-mode export: Complete unified GLB and standalone modular parts
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
PARTS_BASE_DIR = os.path.join(EXPORTS_DIR, "parts")
VEHICLES_BASE_DIR = os.path.join(PROJECT_DIR, "public", "models", "vehicles")

os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(PARTS_BASE_DIR, exist_ok=True)

# ----------------------------------------------------------------------------
# 1. VEHICLE ARCHITECTURE SPECIFICATIONS (in meters)
# ----------------------------------------------------------------------------
FLEET_SPECS = {
    "sedan": {
        "id": "sedan",
        "name": "Executive Sport Sedan",
        "arch_type": "3-Box Executive",
        "wheelbase": 2.850,
        "track_front": 1.620,
        "track_rear": 1.620,
        "ride_height": 0.135,
        "overall_length": 4.880,
        "overall_width": 1.860,
        "overall_height": 1.440,
        "front_overhang": 0.920,
        "rear_overhang": 1.110,
        "hood_height": 0.920,
        "beltline_height": 0.980,
        "roof_length": 1.850,
        "trunk_length": 0.750,
        "wheel_diameter": 0.680,
        "tire_width": 0.245,
        "has_trunk": True,
        "is_race": False,
        "paint_name": "Car_Paint_Midnight_Sapphire",
        "paint_color": (0.008, 0.028, 0.110, 1.0),
        "paint_metallic": 0.94,
        "paint_roughness": 0.08,
    },
    "hatchback": {
        "id": "hatchback",
        "name": "Performance Hot Hatch",
        "arch_type": "2-Box Compact",
        "wheelbase": 2.600,
        "track_front": 1.560,
        "track_rear": 1.560,
        "ride_height": 0.130,
        "overall_length": 4.220,
        "overall_width": 1.800,
        "overall_height": 1.460,
        "front_overhang": 0.840,
        "rear_overhang": 0.780,
        "hood_height": 0.940,
        "beltline_height": 0.960,
        "roof_length": 2.100,
        "trunk_length": 0.000,
        "wheel_diameter": 0.650,
        "tire_width": 0.235,
        "has_trunk": False,
        "is_race": False,
        "paint_name": "Car_Paint_Apex_Cyan",
        "paint_color": (0.020, 0.550, 0.850, 1.0),
        "paint_metallic": 0.88,
        "paint_roughness": 0.10,
    },
    "crossover": {
        "id": "crossover",
        "name": "Urban Crossover AWD",
        "arch_type": "Elevated 2-Box",
        "wheelbase": 2.700,
        "track_front": 1.630,
        "track_rear": 1.630,
        "ride_height": 0.190,
        "overall_length": 4.540,
        "overall_width": 1.880,
        "overall_height": 1.620,
        "front_overhang": 0.880,
        "rear_overhang": 0.960,
        "hood_height": 1.080,
        "beltline_height": 1.120,
        "roof_length": 2.150,
        "trunk_length": 0.000,
        "wheel_diameter": 0.720,
        "tire_width": 0.255,
        "has_trunk": False,
        "is_race": False,
        "paint_name": "Car_Paint_Forest_Green",
        "paint_color": (0.040, 0.250, 0.120, 1.0),
        "paint_metallic": 0.90,
        "paint_roughness": 0.12,
    },
    "suv": {
        "id": "suv",
        "name": "Full-Size Heavy Duty SUV",
        "arch_type": "Large Heavy-Duty 2-Box",
        "wheelbase": 2.980,
        "track_front": 1.680,
        "track_rear": 1.680,
        "ride_height": 0.230,
        "overall_length": 5.080,
        "overall_width": 2.000,
        "overall_height": 1.820,
        "front_overhang": 0.980,
        "rear_overhang": 1.120,
        "hood_height": 1.220,
        "beltline_height": 1.280,
        "roof_length": 2.450,
        "trunk_length": 0.000,
        "wheel_diameter": 0.810,
        "tire_width": 0.285,
        "has_trunk": False,
        "is_race": False,
        "paint_name": "Car_Paint_Crimson_Pearl",
        "paint_color": (0.450, 0.020, 0.050, 1.0),
        "paint_metallic": 0.92,
        "paint_roughness": 0.09,
    },
    "gt3_supercar": {
        "id": "gt3_supercar",
        "name": "Apex GT3 Racing Supercar",
        "arch_type": "Mid-Engine Aero Supercar",
        "wheelbase": 2.720,
        "track_front": 1.680,
        "track_rear": 1.740,
        "ride_height": 0.065,
        "overall_length": 4.650,
        "overall_width": 2.040,
        "overall_height": 1.150,
        "front_overhang": 0.950,
        "rear_overhang": 0.980,
        "hood_height": 0.680,
        "beltline_height": 0.760,
        "roof_length": 1.350,
        "trunk_length": 0.000,
        "wheel_diameter": 0.680,
        "tire_width": 0.325,
        "has_trunk": False,
        "is_race": True,
        "paint_name": "Car_Paint_Rosso_Corsa",
        "paint_color": (0.850, 0.040, 0.060, 1.0),
        "paint_metallic": 0.85,
        "paint_roughness": 0.06,
    }
}

# ----------------------------------------------------------------------------
# 2. PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def get_or_create_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    def set_socket(names, val):
        for n in names:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = val
                return True
        return False

    set_socket(['Base Color'], base_color)
    set_socket(['Metallic'], metallic)
    set_socket(['Roughness'], roughness)
    set_socket(['Alpha'], alpha)
    set_socket(['Specular IOR Level', 'Specular'], 0.5)

    if clearcoat > 0:
        set_socket(['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(['Coat Roughness', 'Clearcoat Roughness'], 0.03)

    if transmission > 0:
        set_socket(['Transmission Weight', 'Transmission'], transmission)
        set_socket(['IOR'], ior)

    if emission:
        set_socket(['Emission Color', 'Emission'], emission)
        set_socket(['Emission Strength'], emission_strength)

    if transmission > 0.0 or alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    return mat

def create_global_materials(spec):
    get_or_create_material("Tire_Rubber_Master", (0.012, 0.012, 0.014, 1.0), metallic=0.0, roughness=0.75)
    get_or_create_material("Wheel_Rim_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.95, roughness=0.15)
    get_or_create_material("Brake_Rotor_CarbonCeramic", (0.28, 0.28, 0.30, 1.0), metallic=0.75, roughness=0.38)
    get_or_create_material("Brembo_Gloss_Red", (0.88, 0.04, 0.06, 1.0), metallic=0.1, roughness=0.12, clearcoat=1.0)
    get_or_create_material("Trim_Piano_Gloss_Black", (0.015, 0.015, 0.018, 1.0), metallic=0.2, roughness=0.05, clearcoat=1.0)
    get_or_create_material("Trim_Satin_Charcoal", (0.04, 0.04, 0.045, 1.0), metallic=0.1, roughness=0.55)
    get_or_create_material("Chrome_High_Mirror", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.02)
    get_or_create_material("Glass_Dielectric_Clear", (0.92, 0.95, 0.98, 1.0), metallic=0.0, roughness=0.005, transmission=0.97, ior=1.52)
    get_or_create_material("Glass_Executive_Tint", (0.15, 0.18, 0.22, 1.0), metallic=0.0, roughness=0.01, transmission=0.65, ior=1.52)
    get_or_create_material("DRL_Ice_Blue_LED", (0.8, 0.95, 1.0, 1.0), emission=(0.2, 0.75, 1.0, 1.0), emission_strength=25.0)
    get_or_create_material("OLED_Taillight_Ruby", (1.0, 0.1, 0.12, 1.0), emission=(1.0, 0.02, 0.04, 1.0), emission_strength=20.0)
    get_or_create_material("Headlight_Projector_Lens", (0.95, 0.98, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=35.0)
    get_or_create_material("Plate_Reflective_White", (0.95, 0.96, 0.98, 1.0), metallic=0.0, roughness=0.18)
    get_or_create_material("Plate_Euro_Blue", (0.02, 0.22, 0.75, 1.0), metallic=0.0, roughness=0.25)
    get_or_create_material("Carbon_Aero_Weave", (0.05, 0.05, 0.06, 1.0), metallic=0.45, roughness=0.22, clearcoat=0.9)
    get_or_create_material("HighVoltage_Orange", (1.0, 0.25, 0.02, 1.0), metallic=0.0, roughness=0.35)
    get_or_create_material("Suspension_Alloy_Billet", (0.78, 0.80, 0.82, 1.0), metallic=0.92, roughness=0.24)
    get_or_create_material("Suspension_Spring_Red", (0.88, 0.04, 0.06, 1.0), metallic=0.1, roughness=0.12)
    get_or_create_material("Damper_Piston_Chrome", (0.95, 0.95, 0.95, 1.0), metallic=1.0, roughness=0.04)
    get_or_create_material("Screen_OLED_Emissive", (0.02, 0.05, 0.10, 1.0), metallic=0.0, roughness=0.08, emission=(0.15, 0.45, 0.95, 1.0), emission_strength=4.0)
    get_or_create_material("Interior_Executive_Leather", (0.08, 0.08, 0.09, 1.0), metallic=0.0, roughness=0.45)
    get_or_create_material("Chassis_Structural_Steel", (0.22, 0.24, 0.26, 1.0), metallic=0.88, roughness=0.35)
    get_or_create_material("Battery_Pack_Aluminum", (0.72, 0.74, 0.76, 1.0), metallic=0.90, roughness=0.25)

    get_or_create_material(
        spec["paint_name"],
        spec["paint_color"],
        metallic=spec["paint_metallic"],
        roughness=spec["paint_roughness"],
        clearcoat=1.0
    )

# ----------------------------------------------------------------------------
# 3. HELPER GEOMETRY GENERATORS
# ----------------------------------------------------------------------------
def reset_scene_for_vehicle(cat_name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

def get_collection(col_name):
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)
    return col

def register_object(obj, col_name, mat_name=None):
    col = get_collection(col_name)
    if obj.name in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.unlink(obj)
    if obj.name not in col.objects:
        col.objects.link(obj)
    if mat_name:
        mat = bpy.data.materials.get(mat_name)
        if mat and (len(obj.data.materials) == 0 or obj.data.materials[0] != mat):
            if len(obj.data.materials) == 0:
                obj.data.materials.append(mat)
            else:
                obj.data.materials[0] = mat
    return obj

def make_box(name, location, size, col_name, mat_name=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0.0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
    for p in obj.data.polygons: p.use_smooth = True
    return register_object(obj, col_name, mat_name)

def make_cylinder(name, location, radius, depth, rot_euler, col_name, mat_name=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot_euler
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    for p in obj.data.polygons: p.use_smooth = True
    return register_object(obj, col_name, mat_name)

# ----------------------------------------------------------------------------
# 4. VEHICLE ASSEMBLY BUILDER
# ----------------------------------------------------------------------------
def build_vehicle_assembly(spec):
    wb = spec["wheelbase"]
    half_wb = wb / 2.0
    front_y = half_wb
    rear_y = -half_wb
    tf = spec["track_front"]
    tr = spec["track_rear"]
    ow = spec["overall_width"]
    ol = spec["overall_length"]
    oh = spec["overall_height"]
    rh = spec["ride_height"]
    w_dia = spec["wheel_diameter"]
    w_rad = w_dia / 2.0
    w_width = spec["tire_width"]
    axle_z = w_rad
    is_race = spec["is_race"]
    paint = spec["paint_name"]
    tag = spec["id"].upper()

    print(f"\n[BUILD] Constructing {spec['name']} ({tag})...")

    # =========================================================================
    # 01_BODY_MAIN (Primary Painted Exterior Surfaces)
    # =========================================================================
    hood_len = spec["front_overhang"] + (front_y * 0.70)
    hood_y = front_y + (spec["front_overhang"] * 0.35)
    hood_z = spec["hood_height"]
    make_box(f"GEO_{tag}_Hood", (0.0, hood_y, hood_z), (ow * 0.76, hood_len, 0.04), "01_Body_Main", paint, bevel=0.03)

    roof_len = spec["roof_length"]
    roof_y = front_y - (roof_len * 0.38)
    roof_z = oh
    make_box(f"GEO_{tag}_Roof", (0.0, roof_y, roof_z), (ow * 0.72, roof_len, 0.04), "01_Body_Main", paint, bevel=0.04)

    for side, s_tag in [(-1, "R"), (1, "L")]:
        fend_x = side * (ow * 0.44)
        make_box(f"GEO_{tag}_Fender_Front_{s_tag}", (fend_x, front_y, hood_z * 0.85), (0.06, hood_len * 1.1, hood_z * 0.45), "01_Body_Main", paint, bevel=0.03)

    for side, s_tag in [(-1, "R"), (1, "L")]:
        qp_x = side * (ow * 0.45)
        qp_len = spec["rear_overhang"] + (half_wb * 0.6)
        qp_y = rear_y - (spec["rear_overhang"] * 0.3)
        make_box(f"GEO_{tag}_QuarterPanel_Rear_{s_tag}", (qp_x, qp_y, spec["beltline_height"] * 0.85), (0.06, qp_len, spec["beltline_height"] * 0.48), "01_Body_Main", paint, bevel=0.03)

    cabin_len = (front_y - rear_y) * 0.95
    door_len = cabin_len / 2.0
    for side, s_tag in [(-1, "R"), (1, "L")]:
        dx = side * (ow * 0.46)
        make_box(f"GEO_{tag}_Door_Front_{s_tag}", (dx, (front_y + rear_y)/2.0 + door_len*0.5, spec["beltline_height"]*0.7), (0.05, door_len*0.95, spec["beltline_height"]*0.65), "01_Body_Main", paint, bevel=0.02)
        make_box(f"GEO_{tag}_Door_Rear_{s_tag}", (dx, (front_y + rear_y)/2.0 - door_len*0.5, spec["beltline_height"]*0.7), (0.05, door_len*0.95, spec["beltline_height"]*0.65), "01_Body_Main", paint, bevel=0.02)

    if spec["has_trunk"]:
        trunk_len = spec["trunk_length"]
        trunk_y = rear_y - (spec["rear_overhang"] * 0.5)
        make_box(f"GEO_{tag}_Trunk_Lid", (0.0, trunk_y, spec["beltline_height"]), (ow * 0.74, trunk_len, 0.04), "01_Body_Main", paint, bevel=0.02)
    else:
        hatch_y = rear_y - (spec["rear_overhang"] * 0.82)
        hatch_h = oh - (rh + 0.35)
        make_box(f"GEO_{tag}_Tailgate_Hatch", (0.0, hatch_y, rh + 0.35 + hatch_h/2.0), (ow * 0.76, 0.05, hatch_h * 0.92), "01_Body_Main", paint, bevel=0.03)

    # =========================================================================
    # 02_BUMPERS_AERO (Fascias, Grilles, Spoilers, Diffusers)
    # =========================================================================
    fb_y = front_y + spec["front_overhang"]
    make_box(f"GEO_{tag}_Bumper_Front", (0.0, fb_y, rh + 0.28), (ow * 0.88, 0.18, 0.42), "02_Bumpers_Aero", paint, bevel=0.04)
    make_box(f"GEO_{tag}_Grille_Lower", (0.0, fb_y + 0.06, rh + 0.18), (ow * 0.62, 0.06, 0.18), "02_Bumpers_Aero", "Trim_Piano_Gloss_Black")

    rb_y = rear_y - spec["rear_overhang"]
    make_box(f"GEO_{tag}_Bumper_Rear", (0.0, rb_y, rh + 0.35), (ow * 0.88, 0.18, 0.48), "02_Bumpers_Aero", paint, bevel=0.04)

    diff_len = 0.55 if not is_race else 0.85
    make_box(f"GEO_{tag}_Diffuser_Rear", (0.0, rb_y + 0.15, rh + 0.08), (ow * 0.78, diff_len, 0.03), "02_Bumpers_Aero", "Carbon_Aero_Weave")
    for sx in [-0.36, -0.12, 0.12, 0.36]:
        make_box(f"GEO_{tag}_Diffuser_Strake_X{int(sx*100)}", (sx, rb_y + 0.15, rh + 0.06), (0.012, diff_len * 0.9, 0.08), "02_Bumpers_Aero", "Carbon_Aero_Weave")

    if is_race:
        wing_y = rb_y - 0.05
        wing_z = oh + 0.08
        make_box(f"GEO_{tag}_Aero_SwanNeck_Rear_Wing", (0.0, wing_y, wing_z), (ow * 0.96, 0.38, 0.035), "02_Bumpers_Aero", "Carbon_Aero_Weave")
        for px in [-0.42, 0.42]:
            make_box(f"GEO_{tag}_Wing_Pylon_X{int(px*100)}", (px, wing_y + 0.08, (oh + wing_z)/2.0 - 0.08), (0.02, 0.14, 0.28), "02_Bumpers_Aero", "Chrome_High_Mirror")
    elif spec["id"] == "hatchback":
        make_box(f"GEO_{tag}_Roof_Aero_Spoiler", (0.0, rear_y - (spec["rear_overhang"] * 0.65), oh + 0.02), (ow * 0.74, 0.32, 0.04), "02_Bumpers_Aero", "Trim_Piano_Gloss_Black")
    elif spec["id"] in ["crossover", "suv"]:
        for side, s_tag in [(-1, "R"), (1, "L")]:
            rx = side * (ow * 0.38)
            make_box(f"GEO_{tag}_Roof_Rack_Rail_{s_tag}", (rx, roof_y, oh + 0.04), (0.03, roof_len * 0.85, 0.04), "02_Bumpers_Aero", "Chrome_High_Mirror")

    floor_len = ol * 0.88
    make_box(f"GEO_{tag}_Aerodynamic_Floor_Pan", (0.0, (front_y + rear_y)/2.0, rh + 0.015), (ow * 0.82, floor_len, 0.02), "02_Bumpers_Aero", "Carbon_Aero_Weave")

    # =========================================================================
    # 03_GLASS_GREENHOUSE (Glazing & Transparent Envelopes)
    # =========================================================================
    ws_y = front_y - (roof_len * 0.12)
    ws_z = (hood_z + oh) / 2.0
    make_box(f"GEO_{tag}_Windshield", (0.0, ws_y, ws_z), (ow * 0.72, 0.75, 0.015), "03_Glass_Greenhouse", "Glass_Dielectric_Clear")
    rg_y = rear_y + (roof_len * 0.15)
    rg_z = (spec["beltline_height"] + oh) / 2.0
    make_box(f"GEO_{tag}_Rear_Window", (0.0, rg_y, rg_z), (ow * 0.70, 0.65, 0.015), "03_Glass_Greenhouse", "Glass_Executive_Tint")
    for side, s_tag in [(-1, "R"), (1, "L")]:
        gx = side * (ow * 0.445)
        make_box(f"GEO_{tag}_Side_Glass_{s_tag}", (gx, (front_y + rear_y)/2.0, (spec["beltline_height"] + oh)/2.0), (0.01, cabin_len * 0.88, (oh - spec["beltline_height"]) * 0.85), "03_Glass_Greenhouse", "Glass_Executive_Tint")

    # =========================================================================
    # 04_LIGHTING (Projector Optics, DRLs, OLED Bars)
    # =========================================================================
    for side, s_tag in [(-1, "R"), (1, "L")]:
        hl_x = side * (ow * 0.36)
        hl_y = fb_y - 0.02
        hl_z = hood_z - 0.06
        make_box(f"GEO_{tag}_Headlight_Housing_{s_tag}", (hl_x, hl_y, hl_z), (0.24, 0.15, 0.09), "04_Lighting", "Trim_Piano_Gloss_Black")
        make_box(f"GEO_{tag}_DRL_Signature_{s_tag}", (hl_x, hl_y + 0.06, hl_z + 0.02), (0.22, 0.02, 0.025), "04_Lighting", "DRL_Ice_Blue_LED")
        make_cylinder(f"GEO_{tag}_Projector_Lens_{s_tag}", (hl_x, hl_y + 0.06, hl_z - 0.015), 0.032, 0.03, (math.radians(90), 0, 0), "04_Lighting", "Headlight_Projector_Lens")

    tb_y = rb_y - 0.02
    tb_z = spec["beltline_height"]
    make_box(f"GEO_{tag}_Taillight_Lightbar", (0.0, tb_y, tb_z), (ow * 0.82, 0.05, 0.06), "04_Lighting", "OLED_Taillight_Ruby")

    # =========================================================================
    # 05_EXTERIOR_HARDWARE (Mirrors, Handles, Wipers, License Plates)
    # =========================================================================
    for side, s_tag in [(-1, "R"), (1, "L")]:
        mx = side * (ow * 0.49)
        my = front_y - 0.08
        mz = spec["beltline_height"] + 0.08
        make_box(f"GEO_{tag}_Mirror_Housing_{s_tag}", (mx, my, mz), (0.16, 0.18, 0.10), "05_Exterior_Hardware", paint, bevel=0.02)
        make_box(f"GEO_{tag}_Mirror_Glass_{s_tag}", (mx, my - 0.07, mz), (0.14, 0.01, 0.08), "05_Exterior_Hardware", "Chrome_High_Mirror")
        make_box(f"GEO_{tag}_Mirror_Indicator_{s_tag}", (mx + side*0.06, my + 0.02, mz), (0.02, 0.14, 0.015), "05_Exterior_Hardware", "DRL_Ice_Blue_LED")

    for side, s_tag in [(-1, "R"), (1, "L")]:
        hx = side * (ow * 0.468)
        make_box(f"GEO_{tag}_Handle_Front_{s_tag}", (hx, (front_y + rear_y)/2.0 + door_len*0.35, spec["beltline_height"] - 0.08), (0.015, 0.16, 0.035), "05_Exterior_Hardware", "Chrome_High_Mirror")
        make_box(f"GEO_{tag}_Handle_Rear_{s_tag}", (hx, (front_y + rear_y)/2.0 - door_len*0.35, spec["beltline_height"] - 0.08), (0.015, 0.16, 0.035), "05_Exterior_Hardware", "Chrome_High_Mirror")

    make_box(f"GEO_{tag}_Wiper_Driver", (-0.30, front_y + 0.04, hood_z + 0.03), (0.50, 0.03, 0.02), "05_Exterior_Hardware", "Trim_Satin_Charcoal")
    make_box(f"GEO_{tag}_Wiper_Passenger", (0.24, front_y + 0.04, hood_z + 0.03), (0.50, 0.03, 0.02), "05_Exterior_Hardware", "Trim_Satin_Charcoal")

    make_box(f"GEO_{tag}_License_Plate_Front_Frame", (0.0, fb_y + 0.07, rh + 0.22), (0.54, 0.015, 0.13), "05_Exterior_Hardware", "Trim_Piano_Gloss_Black")
    make_box(f"GEO_{tag}_License_Plate_Front_Face", (0.0, fb_y + 0.08, rh + 0.22), (0.52, 0.005, 0.11), "05_Exterior_Hardware", "Plate_Reflective_White")
    make_box(f"GEO_{tag}_License_Plate_Front_Euro", (-0.235, fb_y + 0.083, rh + 0.22), (0.045, 0.003, 0.105), "05_Exterior_Hardware", "Plate_Euro_Blue")

    make_box(f"GEO_{tag}_License_Plate_Rear_Frame", (0.0, rb_y - 0.07, rh + 0.38), (0.54, 0.015, 0.13), "05_Exterior_Hardware", "Trim_Piano_Gloss_Black")
    make_box(f"GEO_{tag}_License_Plate_Rear_Face", (0.0, rb_y - 0.08, rh + 0.38), (0.52, 0.005, 0.11), "05_Exterior_Hardware", "Plate_Reflective_White")
    make_box(f"GEO_{tag}_License_Plate_Rear_Euro", (-0.235, rb_y - 0.083, rh + 0.38), (0.045, 0.003, 0.105), "05_Exterior_Hardware", "Plate_Euro_Blue")

    # =========================================================================
    # 06_RUNNING_GEAR (Wheels, Tires, Rotors, Calipers, Suspension)
    # =========================================================================
    wheel_corners = [
        ("FL", 1, front_y, tf),
        ("FR", -1, front_y, tf),
        ("RL", 1, rear_y, tr),
        ("RR", -1, rear_y, tr),
    ]

    for c_tag, side, wy, track_w in wheel_corners:
        wx = side * (track_w / 2.0)
        make_cylinder(f"GEO_{tag}_Tire_{c_tag}", (wx, wy, axle_z), w_rad, w_width, (0, math.radians(90), 0), "06_Running_Gear", "Tire_Rubber_Master")
        make_cylinder(f"GEO_{tag}_Rim_{c_tag}", (wx + side*0.01, wy, axle_z), w_rad * 0.78, w_width * 0.92, (0, math.radians(90), 0), "06_Running_Gear", "Wheel_Rim_Alloy")
        make_cylinder(f"GEO_{tag}_BrakeRotor_{c_tag}", (wx - side*0.04, wy, axle_z), w_rad * 0.60, 0.018, (0, math.radians(90), 0), "06_Running_Gear", "Brake_Rotor_CarbonCeramic")
        make_box(f"GEO_{tag}_BrakeCaliper_{c_tag}", (wx - side*0.04, wy + 0.08, axle_z + 0.08), (0.045, 0.16, 0.085), "06_Running_Gear", "Brembo_Gloss_Red")

        make_box(f"GEO_{tag}_Suspension_UpperArm_{c_tag}", (wx - side*0.14, wy, axle_z + 0.14), (0.16, 0.22, 0.024), "06_Running_Gear", "Suspension_Alloy_Billet")
        make_box(f"GEO_{tag}_Suspension_LowerArm_{c_tag}", (wx - side*0.16, wy, axle_z - 0.08), (0.20, 0.26, 0.032), "06_Running_Gear", "Suspension_Alloy_Billet")
        make_cylinder(f"GEO_{tag}_Suspension_Coilover_Damper_{c_tag}", (wx - side*0.12, wy, axle_z + 0.16), 0.032, 0.36, (math.radians(8), 0, 0), "06_Running_Gear", "Chassis_Structural_Steel")
        make_cylinder(f"GEO_{tag}_Suspension_Coilover_Spring_{c_tag}", (wx - side*0.12, wy, axle_z + 0.16), 0.046, 0.32, (math.radians(8), 0, 0), "06_Running_Gear", "Suspension_Spring_Red")

    make_cylinder(f"GEO_{tag}_Suspension_SwayBar_Front", (0.0, front_y - 0.12, axle_z - 0.05), 0.016, tf * 0.85, (0, math.radians(90), 0), "06_Running_Gear", "Suspension_Alloy_Billet")
    make_cylinder(f"GEO_{tag}_Suspension_SwayBar_Rear", (0.0, rear_y + 0.12, axle_z - 0.05), 0.016, tr * 0.85, (0, math.radians(90), 0), "06_Running_Gear", "Suspension_Alloy_Billet")

    # =========================================================================
    # 07_INTERIOR (Cockpit, Displays, Steering, Console, Seating)
    # =========================================================================
    dash_y = front_y - (roof_len * 0.22)
    dash_z = spec["beltline_height"] - 0.12
    make_box(f"GEO_{tag}_Dashboard", (0.0, dash_y, dash_z), (ow * 0.78, 0.45, 0.28), "07_Interior", "Interior_Executive_Leather")

    make_box(f"GEO_{tag}_Cockpit_Display_Housing", (-0.14, dash_y - 0.05, dash_z + 0.16), (0.76, 0.02, 0.16), "07_Interior", "Trim_Piano_Gloss_Black")
    make_box(f"GEO_{tag}_Cockpit_Display_OLED_Screen", (-0.14, dash_y - 0.06, dash_z + 0.16), (0.74, 0.005, 0.14), "07_Interior", "Screen_OLED_Emissive")

    steer_x = -0.38
    steer_y = dash_y - 0.18
    steer_z = dash_z + 0.12
    make_cylinder(f"GEO_{tag}_Steering_Wheel_Rim", (steer_x, steer_y, steer_z), 0.175, 0.024, (math.radians(22), 0, 0), "07_Interior", "Interior_Executive_Leather")
    make_cylinder(f"GEO_{tag}_Steering_Wheel_Hub", (steer_x, steer_y + 0.01, steer_z), 0.055, 0.035, (math.radians(22), 0, 0), "07_Interior", "Chrome_High_Mirror")

    make_box(f"GEO_{tag}_Center_Console_Bridge", (0.0, dash_y - 0.45, dash_z - 0.15), (0.24, 0.65, 0.18), "07_Interior", "Trim_Piano_Gloss_Black")
    make_cylinder(f"GEO_{tag}_Rotary_Drive_Dial", (0.0, dash_y - 0.35, dash_z - 0.04), 0.038, 0.024, (0, 0, 0), "07_Interior", "Chrome_High_Mirror")

    for side, s_tag in [(-1, "Passenger"), (1, "Driver")]:
        sx = side * (ow * 0.24)
        sy = dash_y - 0.48
        sz = rh + 0.42
        make_box(f"GEO_{tag}_Seat_Base_{s_tag}", (sx, sy, sz), (0.48, 0.52, 0.16), "07_Interior", "Interior_Executive_Leather")
        make_box(f"GEO_{tag}_Seat_Backrest_{s_tag}", (sx, sy - 0.24, sz + 0.36), (0.46, 0.14, 0.62), "07_Interior", "Interior_Executive_Leather")

    if not is_race:
        ry = rear_y + 0.45
        rz = rh + 0.44
        make_box(f"GEO_{tag}_Seat_Rear_Bench", (0.0, ry, rz), (ow * 0.72, 0.54, 0.16), "07_Interior", "Interior_Executive_Leather")
        make_box(f"GEO_{tag}_Seat_Rear_Backrest", (0.0, ry - 0.24, rz + 0.34), (ow * 0.72, 0.14, 0.58), "07_Interior", "Interior_Executive_Leather")

    # =========================================================================
    # 08_CHASSIS_POWERTRAIN (Skateboard / V12, Inverters, Battery, HV Conduits)
    # =========================================================================
    if is_race:
        v12_y = (front_y + rear_y)/2.0 - 0.25
        v12_z = rh + 0.34
        make_box(f"GEO_{tag}_V12_Engine_Block", (0.0, v12_y, v12_z), (0.48, 0.72, 0.44), "08_Chassis_Powertrain", "Chassis_Structural_Steel")
        make_box(f"GEO_{tag}_V12_Carbon_Intake_Plenum", (0.0, v12_y, v12_z + 0.26), (0.42, 0.65, 0.14), "08_Chassis_Powertrain", "Carbon_Aero_Weave")
        for ex_side, ex_tag in [(-1, "L"), (1, "R")]:
            make_cylinder(f"GEO_{tag}_Exhaust_Pipe_{ex_tag}", (ex_side * 0.12, rb_y - 0.05, rh + 0.28), 0.048, 0.35, (math.radians(90), 0, 0), "08_Chassis_Powertrain", "Chrome_High_Mirror")
    else:
        bat_y = (front_y + rear_y) / 2.0
        bat_z = rh + 0.14
        make_box(f"GEO_{tag}_Battery_Enclosure_Tub", (0.0, bat_y, bat_z), (ow * 0.74, wb * 0.78, 0.15), "08_Chassis_Powertrain", "Battery_Pack_Aluminum")
        for idx in range(4):
            by = bat_y + (idx - 1.5) * 0.44
            make_box(f"GEO_{tag}_Battery_Module_800V_Stack_{idx+1}", (0.0, by, bat_z + 0.02), (ow * 0.68, 0.36, 0.09), "08_Chassis_Powertrain", "Chassis_Structural_Steel")
        make_box(f"GEO_{tag}_Front_Drive_Unit_300kW", (0.0, front_y, axle_z), (0.42, 0.44, 0.38), "08_Chassis_Powertrain", "Chassis_Structural_Steel")
        make_box(f"GEO_{tag}_Rear_Drive_Unit_450kW", (0.0, rear_y, axle_z), (0.45, 0.48, 0.40), "08_Chassis_Powertrain", "Chassis_Structural_Steel")
        make_cylinder(f"GEO_{tag}_HV_Cable_Front_L", (-0.16, front_y * 0.72, bat_z + 0.06), 0.018, 0.45, (math.radians(90), 0, 0), "08_Chassis_Powertrain", "HighVoltage_Orange")
        make_cylinder(f"GEO_{tag}_HV_Cable_Front_R", (0.16, front_y * 0.72, bat_z + 0.06), 0.018, 0.45, (math.radians(90), 0, 0), "08_Chassis_Powertrain", "HighVoltage_Orange")
        make_cylinder(f"GEO_{tag}_HV_Cable_Rear_L", (-0.16, rear_y * 0.72, bat_z + 0.06), 0.020, 0.45, (math.radians(90), 0, 0), "08_Chassis_Powertrain", "HighVoltage_Orange")
        make_cylinder(f"GEO_{tag}_HV_Cable_Rear_R", (0.16, rear_y * 0.72, bat_z + 0.06), 0.020, 0.45, (math.radians(90), 0, 0), "08_Chassis_Powertrain", "HighVoltage_Orange")

    # =========================================================================
    # CLASS-A SURFACE SMOOTHING & VERTEX WELDING
    # =========================================================================
    print(f"[WELD] Welding vertices and recalculating smooth normals for {tag}...")
    mesh_count = 0
    for obj in bpy.data.objects:
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
            mesh_count += 1

    print(f"[SUCCESS] Built and smoothed {mesh_count} modular components for {spec['name']}!")
    return mesh_count

# ----------------------------------------------------------------------------
# 5. DUAL-MODE GLB EXPORT PIPELINE
# ----------------------------------------------------------------------------
def export_vehicle_packages(spec):
    cat_id = spec["id"]
    tag = cat_id.upper()
    
    # 1. Complete Unified Vehicle GLB in exports/
    unified_name = f"Car_{cat_id.capitalize() if cat_id != 'gt3_supercar' else 'GT3_Supercar'}_Complete.glb"
    unified_path = os.path.join(EXPORTS_DIR, unified_name)
    print(f"[EXPORT] Saving unified master vehicle: {unified_path}...")

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=unified_path,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"[EXPORT] Finished: {unified_path}")

    # 2. Categorized Standalone Modular Components in exports/parts/<category>/
    cat_parts_dir = os.path.join(PARTS_BASE_DIR, cat_id)
    os.makedirs(cat_parts_dir, exist_ok=True)
    print(f"[EXPORT] Saving {len(bpy.data.objects)} standalone parts into {cat_parts_dir}...")

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue
        clean_name = "".join(c if c.isalnum() or c in ('_', '-') else '_' for c in obj.name)
        part_path = os.path.join(cat_parts_dir, f"{clean_name}.glb")
        obj.select_set(True)
        bpy.ops.export_scene.gltf(
            filepath=part_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
            export_cameras=False,
            export_lights=False
        )
        obj.select_set(False)

    # 3. Synchronize to public/models/vehicles/<category>/
    if cat_id in ["sedan", "hatchback", "crossover", "suv"]:
        pub_dir = os.path.join(VEHICLES_BASE_DIR, cat_id)
        os.makedirs(pub_dir, exist_ok=True)
        pub_master = os.path.join(pub_dir, f"complete-{cat_id}.glb")
        import shutil
        shutil.copy2(unified_path, pub_master)
        print(f"[SYNC] Copied master to {pub_master}")

# ----------------------------------------------------------------------------
# 6. MASTER COMPILER ORCHESTRATION
# ----------------------------------------------------------------------------
def main():
    print("=================================================================")
    print("   AUTOMOTIVE FLEET MASTER BUILDER (ALL 5 VEHICLE PLATFORMS)")
    print("=================================================================")

    target_cats = list(FLEET_SPECS.keys())
    if "--category" in sys.argv:
        idx = sys.argv.index("--category")
        if idx + 1 < len(sys.argv):
            target_cats = [sys.argv[idx + 1]]

    print(f"Target categories: {target_cats}")

    for cat_id in target_cats:
        spec = FLEET_SPECS[cat_id]
        reset_scene_for_vehicle(cat_id)
        create_global_materials(spec)
        build_vehicle_assembly(spec)
        export_vehicle_packages(spec)

    print("\n=================================================================")
    print("✅ COMPLETED ALL 5 MODULAR VEHICLE PACKAGES & EXPORTS 100%")
    print("=================================================================")

if __name__ == "__main__":
    main()
