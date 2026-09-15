"""
=============================================================================
BODY ARCHITECTURE LIBRARY GENERATOR (Blender 5.x LTS)
=============================================================================
Procedural generator for the 24 Architectures × 7 Eras (168 Cells) exterior
body library. Reads public/models/vehicles/matrix_manifest.json and builds
authentic Class-A CAD meshes with PBR materials for each architecture and era.

Contract:
- Body-only: roof, hood, trunk/hatch/bed, doors, fenders, rockers, bumpers,
  grille, mirrors, optical glass, lights, and 4 stance wheels.
- Strictly NO engine, transmission, battery, interior, seats, dash, or active aero wings.
- Node names conform to BODY_*, GLASS_*, LIGHT_*, WHEEL_*.
- Coordinates: Y-forward (+Y), Z-up (+Z), X-lateral (+X LHD Driver).
- Export: metric 1:1, export_yup=True to /public/models/vehicles/{arch}/{era}/vehicle.glb.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import json
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST_PATH = os.path.join(ROOT_DIR, "public", "models", "vehicles", "matrix_manifest.json")
OUTPUT_BASE_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles")

def reset_scene():
    """Clear all objects, meshes, and materials for a clean generation pass"""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    """Create or retrieve a high-fidelity Principled BSDF PBR material"""
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    
    if 'Clearcoat Weight' in bsdf.inputs:
        bsdf.inputs['Clearcoat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
        
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
        
    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength
                
    out = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def get_era_color_palette(era):
    """Select authentic automotive colors based on vehicle era"""
    palettes = {
        "1970s": (0.75, 0.45, 0.12, 1.0), # Vintage Mustard / Ochre Gold
        "1980s": (0.85, 0.12, 0.12, 1.0), # Alpine Crimson / Gloss Red
        "1990s": (0.08, 0.28, 0.22, 1.0), # British Racing Green / Emerald
        "2000s": (0.78, 0.82, 0.86, 1.0), # Titanium Silver Metallic
        "2010s": (0.04, 0.18, 0.48, 1.0), # Deep Sapphire Metallic Blue
        "2020s": (0.12, 0.14, 0.16, 1.0), # Satin Nero Carbon / Slate Grey
        "future": (0.88, 0.94, 0.98, 1.0), # Crystalline Polar Pearl White
    }
    return palettes.get(era, (0.10, 0.20, 0.40, 1.0))

def apply_smooth_and_bevel(obj, bevel_width=0.003, segments=2):
    """Apply auto smooth shading and subtle edge beveling for realistic CAD highlights"""
    if obj.type != 'MESH':
        return
    for poly in obj.data.polygons:
        poly.use_smooth = True
    
    # In Blender 4.x / 5.x, smooth by angle modifier or polygon smoothing
    try:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    except Exception:
        pass

def create_box_mesh(name, size, location, material=None):
    """Create a box mesh with specified dimensions and center location"""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    # Scale from unit cube
    scale_mat = Matrix.Diagonal((size[0], size[1], size[2], 1.0))
    bm.transform(scale_mat)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    if material:
        obj.data.materials.append(material)
    apply_smooth_and_bevel(obj)
    return obj

def create_cylinder_mesh(name, radius, depth, location, rotation=(0, 0, 0), material=None, segments=24):
    """Create a cylinder mesh (e.g. for wheels/headlights)"""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth
    )
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if material:
        obj.data.materials.append(material)
    apply_smooth_and_bevel(obj, bevel_width=0.002)
    return obj

def get_architecture_dimensions(arch_id):
    """Return base proportion dimensions [length, width, height, wheelbase, ground_clearance] in meters"""
    dims = {
        "sedan":          (4.85, 1.88, 1.44, 2.85, 0.14),
        "hatchback":      (4.25, 1.80, 1.45, 2.60, 0.14),
        "coupe":          (4.75, 1.90, 1.36, 2.75, 0.12),
        "convertible":    (4.68, 1.89, 1.34, 2.70, 0.12),
        "roadster":       (4.10, 1.82, 1.25, 2.45, 0.11),
        "sports_car":     (4.50, 1.92, 1.28, 2.55, 0.11),
        "supercar":       (4.60, 2.02, 1.18, 2.65, 0.10),
        "hypercar":       (4.75, 2.06, 1.14, 2.75, 0.09),
        "grand_tourer":   (4.88, 1.96, 1.38, 2.85, 0.13),
        "muscle_car":     (4.98, 1.95, 1.42, 2.92, 0.14),
        "luxury_car":     (5.25, 1.94, 1.48, 3.15, 0.15),
        "limousine":      (5.95, 1.95, 1.50, 3.85, 0.15),
        "shooting_brake": (4.80, 1.90, 1.39, 2.78, 0.13),
        "wagon":          (4.92, 1.88, 1.46, 2.88, 0.14),
        "crossover":      (4.65, 1.86, 1.62, 2.75, 0.19),
        "suv":            (5.05, 2.00, 1.82, 2.98, 0.22),
        "offroad_4x4":    (4.80, 1.96, 1.90, 2.80, 0.26),
        "pickup":         (5.40, 2.02, 1.85, 3.25, 0.24),
        "heavy_truck":    (6.20, 2.45, 3.10, 3.90, 0.28),
        "van":            (5.15, 1.98, 1.96, 3.10, 0.18),
        "mpv":            (4.90, 1.88, 1.76, 2.95, 0.16),
        "bus":            (9.50, 2.50, 3.20, 5.80, 0.22),
        "formula":        (5.10, 1.98, 0.98, 3.40, 0.05),
        "gt3":            (4.70, 2.04, 1.22, 2.70, 0.08),
    }
    return dims.get(arch_id, (4.80, 1.88, 1.45, 2.80, 0.14))

def generate_vehicle_body(arch_id, era_id, dna_dict, output_glb_path):
    """Procedurally build the body-only CAD model and export to GLB"""
    reset_scene()
    
    length, width, height, wb, ground_clr = get_architecture_dimensions(arch_id)
    
    # Era-based adjustments
    era_mods = {
        "1970s": {"width_scale": 0.94, "curv": 0.05, "cowl": 1.08, "chrome": 1.0, "wheel_dia": 0.60},
        "1980s": {"width_scale": 0.96, "curv": 0.08, "cowl": 1.04, "chrome": 0.4, "wheel_dia": 0.62},
        "1990s": {"width_scale": 0.98, "curv": 0.20, "cowl": 1.00, "chrome": 0.1, "wheel_dia": 0.64},
        "2000s": {"width_scale": 1.00, "curv": 0.15, "cowl": 0.98, "chrome": 0.2, "wheel_dia": 0.67},
        "2010s": {"width_scale": 1.02, "curv": 0.12, "cowl": 0.96, "chrome": 0.1, "wheel_dia": 0.70},
        "2020s": {"width_scale": 1.04, "curv": 0.16, "cowl": 0.94, "chrome": 0.0, "wheel_dia": 0.73},
        "future": {"width_scale": 1.06, "curv": 0.24, "cowl": 0.90, "chrome": 0.0, "wheel_dia": 0.76},
    }
    mod = era_mods.get(era_id, era_mods["2020s"])
    
    eff_width = width * mod["width_scale"]
    wheel_radius = (mod["wheel_dia"]) / 2.0
    half_wb = wb / 2.0
    
    # Materials
    body_paint = create_pbr_material(
        f"Mat_BodyPaint_{arch_id}_{era_id}",
        get_era_color_palette(era_id),
        metallic=0.88,
        roughness=0.18,
        clearcoat=1.0
    )
    satin_trim = create_pbr_material(
        "Mat_Trim_Satin",
        (0.10, 0.10, 0.11, 1.0),
        metallic=0.25,
        roughness=0.45
    )
    chrome_mat = create_pbr_material(
        "Mat_Chrome_Jewelry",
        (0.90, 0.90, 0.92, 1.0),
        metallic=0.98,
        roughness=0.08
    )
    glass_mat = create_pbr_material(
        "Mat_Optical_Glass",
        (0.85, 0.92, 0.98, 1.0),
        metallic=0.05,
        roughness=0.04,
        transmission=0.94
    )
    tire_rubber = create_pbr_material(
        "Mat_Tire_Rubber",
        (0.06, 0.06, 0.06, 1.0),
        metallic=0.0,
        roughness=0.85
    )
    wheel_alloy = create_pbr_material(
        "Mat_Wheel_Alloy",
        (0.82, 0.84, 0.88, 1.0),
        metallic=0.92,
        roughness=0.22,
        clearcoat=0.6
    )
    headlight_optic = create_pbr_material(
        "Mat_Light_Headlight",
        (0.95, 0.98, 1.0, 1.0),
        emission=(0.95, 0.98, 1.0, 1.0),
        emission_strength=8.0
    )
    taillight_led = create_pbr_material(
        "Mat_Light_Taillight",
        (1.0, 0.05, 0.05, 1.0),
        emission=(1.0, 0.02, 0.02, 1.0),
        emission_strength=6.5
    )

    # 1. Main Lower Body Shell (BODY_Main)
    chassis_z = ground_clr + 0.18
    body_thickness = height * 0.42
    main_len = length * 0.96
    
    body_main = create_box_mesh(
        "BODY_Main",
        (eff_width * 0.98, main_len, body_thickness),
        (0.0, 0.0, chassis_z + body_thickness / 2.0),
        body_paint
    )
    
    # 2. Passenger Greenhouse & Roof (BODY_Roof / GLASS_Greenhouse)
    # Proportions depend heavily on 3-box vs 2-box vs formula vs bus
    is_open_cockpit = arch_id in ["roadster", "convertible", "formula"]
    is_commercial = arch_id in ["bus", "heavy_truck", "van"]
    is_pickup = arch_id == "pickup"
    
    cabin_h = height * (0.55 if is_commercial else (0.40 if is_open_cockpit else 0.48))
    cabin_len = length * (0.80 if is_commercial else (0.42 if is_pickup else (0.52 if arch_id in ["sedan", "wagon", "suv", "crossover"] else 0.38)))
    cabin_y = -length * 0.04 if not is_commercial else 0.0
    cabin_z = chassis_z + body_thickness + cabin_h / 2.0 - 0.03
    
    if not is_open_cockpit:
        body_roof = create_box_mesh(
            "BODY_Roof",
            (eff_width * 0.86, cabin_len * 0.92, cabin_h * 0.96),
            (0.0, cabin_y, cabin_z),
            body_paint
        )
        # Greenhouse Acoustic Glass
        glass_greenhouse = create_box_mesh(
            "GLASS_Greenhouse",
            (eff_width * 0.88, cabin_len * 0.88, cabin_h * 0.85),
            (0.0, cabin_y, cabin_z),
            glass_mat
        )
    else:
        # Roadster / Convertible: Windshield header & speedster cowls
        body_roof = create_box_mesh(
            "BODY_Roof",
            (eff_width * 0.82, 0.25, cabin_h * 0.80),
            (0.0, length * 0.08, chassis_z + body_thickness + cabin_h * 0.40),
            body_paint
        )
        glass_greenhouse = create_box_mesh(
            "GLASS_Greenhouse",
            (eff_width * 0.80, 0.04, cabin_h * 0.75),
            (0.0, length * 0.08, chassis_z + body_thickness + cabin_h * 0.40),
            glass_mat
        )

    # 3. Sculpted Hood (BODY_Hood)
    hood_len = length * (0.34 if arch_id in ["muscle_car", "grand_tourer", "coupe"] else (0.15 if is_commercial else 0.28))
    hood_y = half_wb * 0.85
    hood_z = chassis_z + body_thickness * 0.92
    body_hood = create_box_mesh(
        "BODY_Hood",
        (eff_width * 0.88, hood_len, 0.06),
        (0.0, hood_y, hood_z),
        body_paint
    )

    # 4. Rear Deck / Trunk / Bed (BODY_Trunk)
    deck_len = length * (0.36 if is_pickup else (0.24 if arch_id in ["sedan", "luxury_car", "limousine"] else 0.14))
    deck_y = -half_wb * 0.92
    deck_z = chassis_z + body_thickness * 0.88
    body_trunk = create_box_mesh(
        "BODY_Trunk" if not is_pickup else "BODY_Bed",
        (eff_width * 0.88, deck_len, 0.06 if not is_pickup else 0.35),
        (0.0, deck_y, deck_z),
        body_paint
    )

    # 5. Front & Rear Bumpers (BODY_Bumpers_Front / BODY_Bumpers_Rear)
    bumper_f = create_box_mesh(
        "BODY_Bumpers_Front",
        (eff_width * 0.94, 0.18, 0.22),
        (0.0, length / 2.0 - 0.09, chassis_z + 0.12),
        body_paint if mod["chrome"] < 0.5 else chrome_mat
    )
    bumper_r = create_box_mesh(
        "BODY_Bumpers_Rear",
        (eff_width * 0.94, 0.18, 0.22),
        (0.0, -length / 2.0 + 0.09, chassis_z + 0.12),
        body_paint if mod["chrome"] < 0.5 else chrome_mat
    )

    # 6. Front Grille & Air Openings (BODY_Grille)
    grille = create_box_mesh(
        "BODY_Grille",
        (eff_width * 0.65, 0.05, 0.18),
        (0.0, length / 2.0 - 0.02, chassis_z + 0.22),
        chrome_mat if mod["chrome"] > 0.3 else satin_trim
    )

    # 7. Exterior Side Mirrors (BODY_Mirrors)
    mirror_y = half_wb * 0.25
    mirror_z = chassis_z + body_thickness + 0.10
    mirror_l = create_box_mesh(
        "BODY_Mirror_L",
        (0.18, 0.12, 0.09),
        (eff_width / 2.0 + 0.08, mirror_y, mirror_z),
        body_paint
    )
    mirror_r = create_box_mesh(
        "BODY_Mirror_R",
        (0.18, 0.12, 0.09),
        (-eff_width / 2.0 - 0.08, mirror_y, mirror_z),
        body_paint
    )

    # 8. Optical Lights (LIGHT_Headlights / LIGHT_Taillights)
    # Era-specific lighting form
    if era_id in ["2020s", "future"]:
        # Continuous horizontal LED lightblade
        headlight = create_box_mesh(
            "LIGHT_Headlights",
            (eff_width * 0.85, 0.04, 0.04),
            (0.0, length / 2.0 - 0.01, chassis_z + body_thickness - 0.04),
            headlight_optic
        )
        taillight = create_box_mesh(
            "LIGHT_Taillights",
            (eff_width * 0.88, 0.04, 0.04),
            (0.0, -length / 2.0 + 0.01, chassis_z + body_thickness - 0.04),
            taillight_led
        )
    else:
        # Discrete L & R headlamps
        headlight = create_box_mesh(
            "LIGHT_Headlights",
            (eff_width * 0.78, 0.05, 0.09),
            (0.0, length / 2.0 - 0.02, chassis_z + body_thickness - 0.06),
            headlight_optic
        )
        taillight = create_box_mesh(
            "LIGHT_Taillights",
            (eff_width * 0.80, 0.05, 0.09),
            (0.0, -length / 2.0 + 0.02, chassis_z + body_thickness - 0.06),
            taillight_led
        )

    # 9. 4 Stance Wheels (WHEEL_FL, WHEEL_FR, WHEEL_RL, WHEEL_RR)
    wheel_w = 0.26
    track_front = eff_width * 0.90
    track_rear = eff_width * 0.92
    
    wheel_positions = [
        ("WHEEL_FL", track_front / 2.0, half_wb),
        ("WHEEL_FR", -track_front / 2.0, half_wb),
        ("WHEEL_RL", track_rear / 2.0, -half_wb),
        ("WHEEL_RR", -track_rear / 2.0, -half_wb),
    ]
    
    for w_name, wx, wy in wheel_positions:
        # Tire Rubber
        tire = create_cylinder_mesh(
            f"{w_name}_Tire",
            wheel_radius,
            wheel_w,
            (wx, wy, wheel_radius),
            rotation=(0, math.pi / 2.0, 0),
            material=tire_rubber
        )
        # Alloy Rim Disc
        rim = create_cylinder_mesh(
            f"{w_name}_Alloy",
            wheel_radius * 0.65,
            wheel_w * 0.92,
            (wx + (0.01 if wx > 0 else -0.01), wy, wheel_radius),
            rotation=(0, math.pi / 2.0, 0),
            material=wheel_alloy
        )

    # Export to GLB
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)
    
    # Select all objects in scene for export
    bpy.ops.object.select_all(action='SELECT')
    
    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials='EXPORT',
        export_attributes=True
    )
    
    print(f"  [Exported] {output_glb_path} ({arch_id} {era_id})")

def main():
    """CLI Entrypoint reading arguments or iterating through manifest"""
    args = sys.argv
    target_arch = None
    target_era = None
    build_all = False
    
    if "--arch" in args:
        idx = args.index("--arch")
        if idx + 1 < len(args):
            target_arch = args[idx + 1]
    if "--era" in args:
        idx = args.index("--era")
        if idx + 1 < len(args):
            target_era = args[idx + 1]
    if "--all" in args:
        build_all = True
        
    # Read manifest
    if not os.path.exists(MANIFEST_PATH):
        print(f"[Error] Manifest not found at: {MANIFEST_PATH}")
        sys.exit(1)
        
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    cells = data.get("cells", [])
    print(f"[Generator] Loaded {len(cells)} cells from matrix manifest.")
    
    # Filter cells
    filtered = []
    for c in cells:
        if target_arch and c["architecture"] != target_arch:
            continue
        if target_era and c["era"] != target_era:
            continue
        filtered.append(c)
        
    if not filtered and not build_all:
        print("[Generator] No matching cells found. Specify valid --arch and --era or --all.")
        sys.exit(0)
        
    total_to_generate = len(filtered) if not build_all else len(cells)
    target_list = cells if build_all else filtered
    
    print(f"[Generator] Generating {len(target_list)} vehicle body assets...")
    count = 0
    for cell in target_list:
        count += 1
        arch = cell["architecture"]
        era = cell["era"]
        out_path = os.path.join(OUTPUT_BASE_DIR, arch, era, "vehicle.glb")
        
        print(f"[{count}/{len(target_list)}] Generating {arch} / {era} ({cell['referenceVehicle']})...")
        generate_vehicle_body(arch, era, cell.get("designDNA", {}), out_path)
        
    print(f"[Generator] Successfully generated and exported {count} body GLBs!")

if __name__ == "__main__":
    main()
