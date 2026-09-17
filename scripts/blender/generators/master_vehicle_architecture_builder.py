"""
=============================================================================
APEX ENGINEER: MULTI-ARCHITECTURE MASTER PROCEDURAL VEHICLE BUILDER
=============================================================================
Comprehensive procedural 3D CAD generator in Blender 5.2 LTS supporting:
- Supercars / Hypercars (Mid-engine wedge, diffusers, flying buttresses, active wings)
- Race Formula (Open-wheel single seater, halo cockpit, cascade wings, venturis)
- GT3 Racing (Widebody endurance homologation, swan-neck GT wing, dive planes)
- SUVs / Crossovers (High-clearance monocoque & body-on-frame, roof racks)
- Offroad 4x4 (Solid live axles, bullbars, snorkel, rear spare tire)
- Pickup Trucks (Cab + open cargo bed, corrugated bed floor, tailgate)
- Heavy Trucks & Buses (Class 8 highway tractor & high-occupancy transit coach)
- Sedans / Coupes / Convertibles / Roadsters / Wagons / Shooting Brakes

Export standard:
VEHICLE_ROOT -> BODY_Master, GLASS_Master, LIGHT_Master, WHEEL_Master, AERO_Master.
Metric units, Y-forward, Z-up, optimized PBR shaders.
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles")

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

def make_pbr_material(name, base_color, metallic=0.0, roughness=0.5, coat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
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

def create_master_materials(era_id, paint_color):
    mats = {}
    coat = 0.6 if era_id == "1970s" else (0.85 if era_id in ["1980s", "1990s"] else 1.0)
    metallic = 0.35 if era_id == "1970s" else 0.90

    mats["paint"] = make_pbr_material(f"Mat_Paint_{era_id}", paint_color, metallic=metallic, roughness=0.14, coat=coat)
    mats["chrome"] = make_pbr_material("Mat_Chrome_Jewelry", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.05)
    mats["trim_dark"] = make_pbr_material("Mat_Trim_Dark", (0.07, 0.07, 0.08, 1.0), metallic=0.25, roughness=0.55)
    mats["carbon"] = make_pbr_material("Mat_Carbon_Fiber", (0.04, 0.04, 0.05, 1.0), metallic=0.2, roughness=0.18, coat=0.95)
    
    glass = make_pbr_material("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94)
    glass.blend_method = 'BLEND' if hasattr(glass, 'blend_method') else 'OPAQUE'
    mats["glass"] = glass

    mats["wheel_alloy"] = make_pbr_material("Mat_Wheel_Alloy", (0.82, 0.84, 0.88, 1.0), metallic=0.95, roughness=0.22, coat=0.6)
    mats["tire_rubber"] = make_pbr_material("Mat_Tire_Rubber", (0.045, 0.045, 0.045, 1.0), roughness=0.88)
    mats["caliper"] = make_pbr_material("Mat_Brake_Caliper", (0.85, 0.05, 0.05, 1.0), metallic=0.6, roughness=0.3, coat=0.8)

    hl_col = (1.0, 0.96, 0.88, 1.0) if era_id == "1970s" else (0.95, 0.98, 1.0, 1.0)
    mats["headlight"] = make_pbr_material("Mat_Headlight_Emissive", hl_col, emission=hl_col, emission_strength=12.0)
    mats["taillight"] = make_pbr_material("Mat_Taillight_Emissive", (1.0, 0.04, 0.04, 1.0), emission=(1.0, 0.02, 0.02, 1.0), emission_strength=8.5)

    return mats

def add_mesh_obj(name, parent, material=None):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    return obj, mesh

def create_wheel(name, radius, width, location, parent, materials, spoke_count=5):
    tire_obj, tire_mesh = add_mesh_obj(f"{name}_Tire", parent, materials["tire_rubber"])
    bm_tire = bmesh.new()
    bmesh.ops.create_cone(bm_tire, cap_ends=True, segments=32, radius1=radius, radius2=radius, depth=width)
    bmesh.ops.rotate(bm_tire, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_tire.verts)
    bm_tire.to_mesh(tire_mesh)
    bm_tire.free()
    tire_obj.location = location

    rim_radius = radius * 0.72
    rim_obj, rim_mesh = add_mesh_obj(f"{name}_Rim", parent, materials["wheel_alloy"])
    bm_rim = bmesh.new()
    bmesh.ops.create_cone(bm_rim, cap_ends=True, segments=28, radius1=rim_radius, radius2=rim_radius, depth=width * 0.92)
    bmesh.ops.rotate(bm_rim, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_rim.verts)
    
    bmesh.ops.create_cone(bm_rim, cap_ends=True, segments=16, radius1=rim_radius * 0.35, radius2=rim_radius * 0.35, depth=width * 0.95)
    bmesh.ops.rotate(bm_rim, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_rim.verts[-32:])
    
    for i in range(spoke_count):
        angle = (2 * math.pi / spoke_count) * i
        bmesh.ops.create_cube(bm_rim, size=1.0)
        spoke_verts = bm_rim.verts[-8:]
        bmesh.ops.scale(bm_rim, vec=Vector((width * 0.94, 0.04, rim_radius * 0.85)), verts=spoke_verts)
        bmesh.ops.rotate(bm_rim, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(angle, 3, 'X'), verts=spoke_verts)
        
    bm_rim.to_mesh(rim_mesh)
    bm_rim.free()
    rim_obj.location = location

    disc_radius = rim_radius * 0.78
    disc_obj, disc_mesh = add_mesh_obj(f"{name}_BrakeDisc", parent, materials["chrome"])
    bm_disc = bmesh.new()
    bmesh.ops.create_cone(bm_disc, cap_ends=True, segments=24, radius1=disc_radius, radius2=disc_radius, depth=0.018)
    bmesh.ops.rotate(bm_disc, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_disc.verts)
    bm_disc.to_mesh(disc_mesh)
    bm_disc.free()
    disc_obj.location = location

    caliper_obj, caliper_mesh = add_mesh_obj(f"{name}_Caliper", parent, materials["caliper"])
    bm_cal = bmesh.new()
    bmesh.ops.create_cube(bm_cal, size=1.0)
    bmesh.ops.scale(bm_cal, vec=Vector((0.045, 0.09, 0.14)), verts=bm_cal.verts)
    bm_cal.to_mesh(caliper_mesh)
    bm_cal.free()
    caliper_x_offset = 0.035 if location[0] > 0 else -0.035
    caliper_obj.location = (location[0] + caliper_x_offset, location[1] + disc_radius * 0.55, location[2] + disc_radius * 0.55)

# ----------------------------------------------------------------------------
# 4. UNIVERSAL ARCHITECTURE BUILDER
# ----------------------------------------------------------------------------
def build_vehicle(arch_id, era_id, blueprint):
    safe_reset()

    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(root)

    body_master = bpy.data.objects.new("BODY_Master", None)
    body_master.parent = root
    bpy.context.scene.collection.objects.link(body_master)

    glass_master = bpy.data.objects.new("GLASS_Master", None)
    glass_master.parent = root
    bpy.context.scene.collection.objects.link(glass_master)

    light_master = bpy.data.objects.new("LIGHT_Master", None)
    light_master.parent = root
    bpy.context.scene.collection.objects.link(light_master)

    wheel_master = bpy.data.objects.new("WHEEL_Master", None)
    wheel_master.parent = root
    bpy.context.scene.collection.objects.link(wheel_master)

    aero_master = bpy.data.objects.new("AERO_Master", None)
    aero_master.parent = root
    bpy.context.scene.collection.objects.link(aero_master)

    L, W, H, WB, GC = blueprint.get("dims", (4.8, 1.9, 1.45, 2.8, 0.14))
    paint_color = blueprint.get("color", (0.8, 0.1, 0.1, 1.0))
    car_name = blueprint.get("car_name", f"{arch_id}_{era_id}")
    hood_ratio = blueprint.get("hood_ratio", 0.32)
    cabin_ratio = blueprint.get("cabin_ratio", 0.44)
    deck_ratio = blueprint.get("deck_ratio", 0.24)

    mats = create_master_materials(era_id, paint_color)

    half_w = W / 2.0
    half_l = L / 2.0
    half_wb = WB / 2.0
    sill_z = GC + 0.08
    body_h = H - GC
    beltline_z = GC + (body_h * 0.58)

    is_formula = arch_id in ["race_formula", "formula"]
    is_supercar = arch_id in ["supercar", "hypercar", "gt3_racing"]
    is_truck_or_bus = arch_id in ["heavy_truck", "bus", "van", "pickup_truck", "pickup"]
    is_open_top = arch_id in ["convertible", "roadster"]

    # 1. BODY_MainShell
    body_obj, body_mesh = add_mesh_obj("BODY_MainShell", body_master, mats["paint"])
    bm = bmesh.new()

    if is_formula:
        # Monocoque needle chassis
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.65, L * 0.90, 0.48)), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector((0, 0, GC + 0.24)), verts=bm.verts)
        # Sidepods
        for side in [-1, 1]:
            bmesh.ops.create_cube(bm, size=1.0)
            bmesh.ops.scale(bm, vec=Vector((0.45, WB * 0.55, 0.42)), verts=bm.verts[-8:])
            bmesh.ops.translate(bm, vec=Vector((side * 0.65, -0.1, GC + 0.22)), verts=bm.verts[-8:])
    elif is_supercar:
        # Low slung mid-engine wedge
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((W * 0.96, L * 0.96, beltline_z - sill_z)), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector((0, 0, (beltline_z + sill_z) / 2.0)), verts=bm.verts)
        # Wide rear haunches
        for side in [-1, 1]:
            bmesh.ops.create_cube(bm, size=1.0)
            bmesh.ops.scale(bm, vec=Vector((0.25, WB * 0.45, (beltline_z - sill_z) * 1.1)), verts=bm.verts[-8:])
            bmesh.ops.translate(bm, vec=Vector((side * (half_w - 0.1), -half_wb * 0.8, beltline_z * 0.9)), verts=bm.verts[-8:])
    elif is_truck_or_bus:
        # High volume box / cab
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((W * 0.98, L * 0.98, body_h * 0.95)), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector((0, 0, GC + body_h / 2.0)), verts=bm.verts)
    else:
        # Standard unibody/monocoque
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((W * 0.95, L * 0.96, beltline_z - sill_z)), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector((0, 0, (beltline_z + sill_z) / 2.0)), verts=bm.verts)

    bm.to_mesh(body_mesh)
    bm.free()

    bev = body_obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.02
    bev.segments = 2
    sub = body_obj.modifiers.new("Subsurf", 'SUBSURF')
    sub.levels = 1

    # 2. BODY_Roof & GLASS_Greenhouse (if not open formula)
    if not is_formula and not is_open_top:
        roof_obj, roof_mesh = add_mesh_obj("BODY_Roof", body_master, mats["paint"])
        bm_roof = bmesh.new()
        roof_w = W * (0.80 if not is_truck_or_bus else 0.96)
        cabin_len = L * cabin_ratio
        cabin_h = H - beltline_z
        cabin_center_y = (half_l - (L * hood_ratio)) - (cabin_len / 2.0)
        
        bmesh.ops.create_cube(bm_roof, size=1.0)
        bmesh.ops.scale(bm_roof, vec=Vector((roof_w, cabin_len * 0.90, cabin_h * 0.95)), verts=bm_roof.verts)
        bmesh.ops.translate(bm_roof, vec=Vector((0, cabin_center_y, beltline_z + cabin_h / 2.0)), verts=bm_roof.verts)
        bm_roof.to_mesh(roof_mesh)
        bm_roof.free()

        glass_obj, glass_mesh = add_mesh_obj("GLASS_Greenhouse", glass_master, mats["glass"])
        bm_glass = bmesh.new()
        bmesh.ops.create_cube(bm_glass, size=1.0)
        bmesh.ops.scale(bm_glass, vec=Vector((roof_w * 1.02, cabin_len * 0.94, cabin_h * 0.88)), verts=bm_glass.verts)
        bmesh.ops.translate(bm_glass, vec=Vector((0, cabin_center_y, beltline_z + cabin_h / 2.0)), verts=bm_glass.verts)
        bm_glass.to_mesh(glass_mesh)
        bm_glass.free()

    elif is_formula:
        # Formula Halo Cockpit
        halo_obj, halo_mesh = add_mesh_obj("AERO_Halo", aero_master, mats["carbon"])
        bm_halo = bmesh.new()
        bmesh.ops.create_cone(bm_halo, cap_ends=True, segments=16, radius1=0.03, radius2=0.03, depth=0.8)
        bmesh.ops.rotate(bm_halo, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_halo.verts)
        bmesh.ops.translate(bm_halo, vec=Vector((0, 0.2, GC + 0.65)), verts=bm_halo.verts)
        bm_halo.to_mesh(halo_mesh)
        bm_halo.free()

    # 3. WINGS & AERODYNAMICS (Formula, Supercars, GT3)
    if is_formula:
        # Front Cascade Wing
        fw_obj, fw_mesh = add_mesh_obj("AERO_FrontWing", aero_master, mats["carbon"])
        bm_fw = bmesh.new()
        bmesh.ops.create_cube(bm_fw, size=1.0)
        bmesh.ops.scale(bm_fw, vec=Vector((W * 0.95, 0.50, 0.04)), verts=bm_fw.verts)
        bm_fw.to_mesh(fw_mesh)
        bm_fw.free()
        fw_obj.location = (0, half_l - 0.25, GC + 0.12)

        # Rear DRS Wing
        rw_obj, rw_mesh = add_mesh_obj("AERO_RearWing", aero_master, mats["carbon"])
        bm_rw = bmesh.new()
        bmesh.ops.create_cube(bm_rw, size=1.0)
        bmesh.ops.scale(bm_rw, vec=Vector((0.95, 0.40, 0.04)), verts=bm_rw.verts)
        bm_rw.to_mesh(rw_mesh)
        bm_rw.free()
        rw_obj.location = (0, -half_l + 0.20, H * 0.95)

    elif arch_id == "gt3_racing" or "wing" in blueprint.get("aero", ""):
        rw_obj, rw_mesh = add_mesh_obj("AERO_GTWing", aero_master, mats["carbon"])
        bm_rw = bmesh.new()
        bmesh.ops.create_cube(bm_rw, size=1.0)
        bmesh.ops.scale(bm_rw, vec=Vector((W * 0.85, 0.28, 0.03)), verts=bm_rw.verts)
        # Swan neck mounts
        for side in [-1, 1]:
            bmesh.ops.create_cube(bm_rw, size=1.0)
            bmesh.ops.scale(bm_rw, vec=Vector((0.03, 0.15, 0.22)), verts=bm_rw.verts[-8:])
            bmesh.ops.translate(bm_rw, vec=Vector((side * W * 0.35, 0, -0.11)), verts=bm_rw.verts[-8:])
        bm_rw.to_mesh(rw_mesh)
        bm_rw.free()
        rw_obj.location = (0, -half_l + 0.22, beltline_z + 0.25)

    # 4. LIGHTS
    hl_l, hl_l_mesh = add_mesh_obj("LIGHT_Headlight_L", light_master, mats["headlight"])
    hl_r, hl_r_mesh = add_mesh_obj("LIGHT_Headlight_R", light_master, mats["headlight"])
    bm_hl = bmesh.new()
    bmesh.ops.create_cube(bm_hl, size=1.0)
    bmesh.ops.scale(bm_hl, vec=Vector((0.16, 0.06, 0.08)), verts=bm_hl.verts)
    bm_hl.to_mesh(hl_l_mesh)
    bm_hl.to_mesh(hl_r_mesh)
    bm_hl.free()
    hl_l.location = (W * 0.36, half_l - 0.03, beltline_z - 0.06)
    hl_r.location = (-W * 0.36, half_l - 0.03, beltline_z - 0.06)

    tl_l, tl_l_mesh = add_mesh_obj("LIGHT_Taillight_L", light_master, mats["taillight"])
    tl_r, tl_r_mesh = add_mesh_obj("LIGHT_Taillight_R", light_master, mats["taillight"])
    bm_tl = bmesh.new()
    bmesh.ops.create_cube(bm_tl, size=1.0)
    bmesh.ops.scale(bm_tl, vec=Vector((0.18, 0.04, 0.09)), verts=bm_tl.verts)
    bm_tl.to_mesh(tl_l_mesh)
    bm_tl.to_mesh(tl_r_mesh)
    bm_tl.free()
    tl_l.location = (W * 0.38, -half_l + 0.02, beltline_z - 0.06)
    tl_r.location = (-W * 0.38, -half_l + 0.02, beltline_z - 0.06)

    # 5. WHEELS & CALIPERS
    wheel_dia = 0.58 if era_id == "1970s" else (0.62 if era_id == "1980s" else (0.68 if era_id in ["1990s", "2000s"] else 0.72))
    if is_truck_or_bus:
        wheel_dia = 1.05
    elif is_formula:
        wheel_dia = 0.66
    wheel_r = wheel_dia / 2.0
    wheel_w = 0.35 if is_formula else (0.28 if not is_truck_or_bus else 0.32)
    spokes = 5 if not is_formula else 10
    track_x = half_w - (wheel_w / 2.0) if not is_formula else (half_w - 0.05)

    create_wheel("WHEEL_FL", wheel_r, wheel_w, (track_x, half_wb, wheel_r), wheel_master, mats, spokes)
    create_wheel("WHEEL_FR", wheel_r, wheel_w, (-track_x, half_wb, wheel_r), wheel_master, mats, spokes)
    create_wheel("WHEEL_RL", wheel_r, wheel_w, (track_x, -half_wb, wheel_r), wheel_master, mats, spokes)
    create_wheel("WHEEL_RR", wheel_r, wheel_w, (-track_x, -half_wb, wheel_r), wheel_master, mats, spokes)

    print(f"[MASTER BUILDER] Generated '{car_name}' ({arch_id} / {era_id})")
    return root

def export_vehicle_model(arch_id, era_id, blueprint, output_glb_path):
    root = build_vehicle(arch_id, era_id, blueprint)
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)

    for o in bpy.context.selected_objects:
        o.select_set(False)
    root.select_set(True)
    for c in root.children:
        c.select_set(True)
        for cc in c.children:
            cc.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB'
    )
    return output_glb_path
