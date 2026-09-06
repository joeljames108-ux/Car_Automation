"""
Validation test script for v13.0 CAD primitives and materials in Blender 5.2.1 LTS.
"""
import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Euler

def get_or_create_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, emission=None, emission_strength=1.0, transmission=0.0, ior=1.45, alpha=1.0, sheen=0.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    pbr = nodes.get("Principled BSDF")
    if not pbr:
        pbr = nodes.new("ShaderNodeBsdfPrincipled")
    if "Base Color" in pbr.inputs:
        pbr.inputs["Base Color"].default_value = base_color
    if "Metallic" in pbr.inputs:
        pbr.inputs["Metallic"].default_value = metallic
    if "Roughness" in pbr.inputs:
        pbr.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in pbr.inputs:
        pbr.inputs["Coat Weight"].default_value = clearcoat
    elif "Clearcoat" in pbr.inputs:
        pbr.inputs["Clearcoat"].default_value = clearcoat
    if "Transmission Weight" in pbr.inputs:
        pbr.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in pbr.inputs:
        pbr.inputs["Transmission"].default_value = transmission
    if "IOR" in pbr.inputs:
        pbr.inputs["IOR"].default_value = ior
    if "Sheen Weight" in pbr.inputs:
        pbr.inputs["Sheen Weight"].default_value = sheen
    elif "Sheen" in pbr.inputs:
        pbr.inputs["Sheen"].default_value = sheen
    if emission and "Emission Color" in pbr.inputs:
        pbr.inputs["Emission Color"].default_value = emission
        if "Emission Strength" in pbr.inputs:
            pbr.inputs["Emission Strength"].default_value = emission_strength
    elif emission and "Emission" in pbr.inputs:
        pbr.inputs["Emission"].default_value = emission
    if alpha < 1.0:
        if "Alpha" in pbr.inputs:
            pbr.inputs["Alpha"].default_value = alpha
        mat.blend_method = 'BLEND'
    return mat

def create_interior_material_suite():
    mats = {}
    mats["leather_ebony"] = get_or_create_material("Int_Leather_Nappa_Ebony", (0.025, 0.025, 0.028, 1.0), roughness=0.62)
    mats["wood_walnut"] = get_or_create_material("Int_Wood_OpenPore_Walnut", (0.24, 0.13, 0.07, 1.0), roughness=0.32, clearcoat=0.35)
    mats["wood_pianoblack"] = get_or_create_material("Int_Wood_Piano_Black", (0.012, 0.012, 0.015, 1.0), roughness=0.03, clearcoat=1.0)
    mats["carbon_twill"] = get_or_create_material("Int_Carbon_Twill_3K", (0.04, 0.04, 0.045, 1.0), metallic=0.35, roughness=0.12, clearcoat=1.0)
    mats["metal_brushed"] = get_or_create_material("Int_Metal_Brushed_Aluminum", (0.82, 0.83, 0.85, 1.0), metallic=0.94, roughness=0.20)
    mats["chrome_jewel"] = get_or_create_material("Int_Chrome_Jewel_Cut", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.02, clearcoat=1.0)
    mats["chrome_satin"] = get_or_create_material("Int_Chrome_Satin_Electroplate", (0.88, 0.89, 0.91, 1.0), metallic=0.95, roughness=0.12)
    mats["anodized_red"] = get_or_create_material("Int_Anodized_Racing_Red", (0.92, 0.08, 0.12, 1.0), metallic=0.88, roughness=0.18, clearcoat=0.8)
    mats["anodized_gold"] = get_or_create_material("Int_Anodized_Gold_Trim", (0.88, 0.72, 0.18, 1.0), metallic=0.90, roughness=0.22)
    mats["titanium_finish"] = get_or_create_material("Int_Titanium_Satin", (0.55, 0.58, 0.62, 1.0), metallic=0.95, roughness=0.25)
    mats["ambient_iceblue"] = get_or_create_material("Int_Ambient_LED_IceBlue", (0.15, 0.75, 1.0, 1.0), emission=(0.15, 0.75, 1.0, 1.0), emission_strength=22.0)
    mats["ambient_amber"] = get_or_create_material("Int_Ambient_LED_Amber", (1.0, 0.55, 0.05, 1.0), emission=(1.0, 0.55, 0.05, 1.0), emission_strength=22.0)
    mats["rubber_traction"] = get_or_create_material("Int_Rubber_Ribbed_Traction", (0.03, 0.03, 0.035, 1.0), roughness=0.85)
    mats["glass_clear"] = get_or_create_material("Int_Glass_Optical_Clear", (0.95, 0.98, 1.0, 0.25), roughness=0.01, transmission=0.98, ior=1.52, alpha=0.25)
    mats["billet_aluminum"] = get_or_create_material("Int_Billet_Raw_Aluminum", (0.88, 0.88, 0.90, 1.0), metallic=0.96, roughness=0.15)
    mats["braided_steel"] = get_or_create_material("Int_Braided_Stainless_Steel", (0.75, 0.77, 0.80, 1.0), metallic=0.92, roughness=0.35)
    mats["brass_watchmaker"] = get_or_create_material("Int_Brass_Watchmaker_Polished", (0.90, 0.75, 0.35, 1.0), metallic=0.95, roughness=0.22)
    mats["an_fitting_blue"] = get_or_create_material("Int_AN_Fitting_Blue", (0.05, 0.22, 0.88, 1.0), metallic=0.92, roughness=0.18, clearcoat=0.85)

    # 8 NEW v13.0 PBR MATERIALS
    mats["synthetic_ruby"] = get_or_create_material("Int_Synthetic_Ruby_Corundum", (0.88, 0.02, 0.12, 0.85), roughness=0.01, transmission=0.94, ior=1.77, alpha=0.85)
    mats["anodized_petrol_blue"] = get_or_create_material("Int_Anodized_Petrol_Blue", (0.03, 0.28, 0.45, 1.0), metallic=0.92, roughness=0.18, clearcoat=0.85)
    mats["leather_semi_aniline_saddle"] = get_or_create_material("Int_Leather_Saddle_Tan", (0.58, 0.34, 0.18, 1.0), roughness=0.58, sheen=0.35)
    mats["damascus_steel"] = get_or_create_material("Int_Damascus_Steel_Layered", (0.35, 0.36, 0.38, 1.0), metallic=0.96, roughness=0.22)
    mats["hud_projection_cyan"] = get_or_create_material("Int_HUD_Projection_Cyan", (0.10, 0.90, 1.0, 0.90), emission=(0.10, 0.90, 1.0, 1.0), emission_strength=30.0, transmission=0.95, alpha=0.90)
    mats["hydraulic_fluid_amber"] = get_or_create_material("Int_Hydraulic_DOT5_Amber", (0.92, 0.72, 0.20, 0.55), roughness=0.08, transmission=0.88, ior=1.43, alpha=0.55)
    mats["copper_woven_mesh"] = get_or_create_material("Int_Copper_Woven_Mesh", (0.85, 0.48, 0.28, 1.0), metallic=0.98, roughness=0.30)
    mats["carbon_matte_dry"] = get_or_create_material("Int_Carbon_Matte_Dry", (0.04, 0.04, 0.045, 1.0), metallic=0.15, roughness=0.42)

    return mats

def make_box(name, location, size, mat, bevel=0.003, segments=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = segments
        bev.profile = 0.7
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, mat=None, vertices=24, bevel=0.002):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_torus(name, location, major_radius, minor_radius, rot_euler, mat=None, major_segments=24, minor_segments=8):
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
    return obj

def make_cone(name, location, radius1, radius2, depth, rot_euler, mat=None, vertices=20):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_knurled_cylinder(name, location, radius, depth, rot_euler, mat=None, ridges=24, ridge_depth_ratio=0.08):
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
    return obj

# 1. Hydraulic Handbrake Assembly
def make_hydraulic_handbrake_assembly(name, location, rot_euler=(0, 0, 0), mats=None, finish="anodized_red"):
    lx, ly, lz = location
    lever_mat = mats["anodized_red"] if finish == "anodized_red" else mats["anodized_petrol_blue"]
    make_box(f"{name}_Base", (lx, ly, lz), (0.045, 0.16, 0.055), mats["billet_aluminum"], bevel=0.003)
    make_box(f"{name}_Upright_Lever", (lx, ly + 0.02, lz + 0.13), (0.016, 0.028, 0.24), lever_mat, bevel=0.002)
    for s_idx in [-0.04, 0.02, 0.08]:
        make_cylinder(f"{name}_Slot_{s_idx}", (lx, ly + 0.02, lz + 0.13 + s_idx), 0.005, 0.020, (0, math.radians(90), 0), mats["wood_pianoblack"], vertices=12)
    make_knurled_cylinder(f"{name}_Grip", (lx, ly + 0.02, lz + 0.22), 0.014, 0.09, (0, 0, 0), mats["titanium_finish"], ridges=20)
    make_box(f"{name}_Trigger", (lx, ly + 0.035, lz + 0.20), (0.008, 0.010, 0.06), mats["chrome_satin"], bevel=0.001)
    make_cylinder(f"{name}_Master_Cylinder", (lx, ly - 0.03, lz + 0.02), 0.015, 0.075, (math.radians(90), 0, 0), mats["billet_aluminum"], vertices=20)
    make_cylinder(f"{name}_Clevis_Pin", (lx, ly + 0.015, lz + 0.02), 0.004, 0.022, (0, math.radians(90), 0), mats["chrome_satin"], vertices=12)
    make_cylinder(f"{name}_AN_Fitting", (lx, ly - 0.072, lz + 0.02), 0.0065, 0.012, (math.radians(90), 0, 0), mats["an_fitting_blue"], vertices=16)
    make_cylinder(f"{name}_Braided_Line", (lx, ly - 0.11, lz + 0.02), 0.004, 0.070, (math.radians(90), 0, 0), mats["braided_steel"], vertices=12)

# 2. Augmented Reality HUD Collimator
def make_augmented_reality_hud_collimator(name, location, rot_euler=(0, 0, 0), mats=None):
    lx, ly, lz = location
    make_box(f"{name}_ApertureWell", (lx, ly, lz), (0.18, 0.11, 0.035), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_Baffle_1", (lx, ly, lz - 0.006), (0.16, 0.095, 0.025), mats["carbon_matte_dry"], bevel=0.002)
    make_box(f"{name}_Baffle_2", (lx, ly, lz - 0.012), (0.14, 0.080, 0.020), mats["carbon_matte_dry"], bevel=0.002)
    make_box(f"{name}_CombinerGlass", (lx, ly, lz + 0.004), (0.16, 0.088, 0.004), mats["glass_clear"], bevel=0.001)
    make_box(f"{name}_HUD_Reticle", (lx, ly, lz + 0.006), (0.09, 0.045, 0.001), mats["hud_projection_cyan"], bevel=0)

# 3. Tourbillon Multi-Axis Escapement Module
def make_tourbillon_multi_axis_escapement(name, location, rot_euler=(0, 0, 0), mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_Housing", (lx, ly, lz), 0.025, 0.016, rot_euler, mats["brass_watchmaker"], vertices=24, bevel=0.001)
    make_torus(f"{name}_Cage_Ring", (lx, ly, lz + 0.004), 0.021, 0.0022, rot_euler, mats["titanium_finish"], major_segments=24, minor_segments=8)
    for angle in [0, 120, 240]:
        make_box(f"{name}_Bridge_{angle}", (lx, ly, lz + 0.004), (0.038, 0.003, 0.002), mats["titanium_finish"], bevel=0.0005)
    make_torus(f"{name}_Balance_Wheel", (lx, ly, lz + 0.007), 0.013, 0.0016, rot_euler, mats["anodized_gold"], major_segments=20, minor_segments=6)
    make_cylinder(f"{name}_Chaton", (lx, ly, lz + 0.008), 0.0055, 0.003, rot_euler, mats["anodized_gold"], vertices=16)
    make_cylinder(f"{name}_Ruby_Jewel", (lx, ly, lz + 0.009), 0.0035, 0.0025, rot_euler, mats["synthetic_ruby"], vertices=16)
    for s_angle in [60, 180, 300]:
        sx = lx + 0.016 * math.cos(math.radians(s_angle))
        sy = ly + 0.016 * math.sin(math.radians(s_angle))
        make_cylinder(f"{name}_Screw_{s_angle}", (sx, sy, lz + 0.008), 0.0018, 0.003, rot_euler, mats["anodized_petrol_blue"], vertices=10)
    make_cylinder(f"{name}_Sapphire_Dome", (lx, ly, lz + 0.011), 0.024, 0.006, rot_euler, mats["glass_clear"], vertices=24)

# 4. Haptic Rotary Command Dial
def make_haptic_rotary_command_dial(name, location, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_BaseBezel", (lx, ly, lz), 0.038, 0.008, (0, 0, 0), mats["titanium_finish"], vertices=28, bevel=0.001)
    make_knurled_cylinder(f"{name}_KnurledDial", (lx, ly, lz + 0.008), 0.032, 0.014, (0, 0, 0), mats["chrome_satin"], ridges=28)
    make_cylinder(f"{name}_TouchSurface", (lx, ly, lz + 0.015), 0.027, 0.003, (0, 0, 0), mats["wood_pianoblack"], vertices=24)
    for k_idx, k_angle in enumerate([30, 75, 120, 165, 210, 255, 300, 345]):
        kx = lx + 0.046 * math.cos(math.radians(k_angle))
        ky = ly + 0.046 * math.sin(math.radians(k_angle))
        make_box(f"{name}_Key_{k_idx+1}", (kx, ky, lz + 0.004), (0.014, 0.012, 0.004), mats["wood_pianoblack"], bevel=0.001)
        make_cylinder(f"{name}_KeyLED_{k_idx+1}", (kx, ky, lz + 0.006), 0.002, 0.002, (0, 0, 0), mats["ambient_iceblue"], vertices=8)
    make_box(f"{name}_WristRest", (lx, ly - 0.08, lz - 0.005), (0.09, 0.055, 0.022), mats["leather_ebony"], bevel=0.005)

# 5. 3D-Knitted Perforated Seat Accent
def make_3d_knitted_perforated_seat_accent(name, location, size=(0.32, 0.38, 0.015), mats=None, accent_mat="anodized_petrol_blue"):
    lx, ly, lz = location
    w, d, h = size
    u_mat = mats.get(accent_mat, mats["anodized_petrol_blue"])
    make_box(f"{name}_AccentUnderlayer", (lx, ly, lz - 0.004), (w * 0.96, d * 0.96, 0.004), u_mat, bevel=0.001)
    make_box(f"{name}_PerforatedFace", (lx, ly, lz), (w, d, 0.006), mats["leather_ebony"], bevel=0.003)
    for r_idx in range(5):
        ry = ly - d * 0.35 + r_idx * (d * 0.175)
        make_box(f"{name}_ContourRib_{r_idx+1}", (lx, ry, lz + 0.004), (w * 0.88, 0.014, 0.005), mats["leather_ebony"], bevel=0.002)

# 6. Steering Column Telescopic Shroud
def make_steering_column_telescopic_shroud(name, location, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_ColumnHousing", (lx, ly, lz), 0.042, 0.12, (math.radians(-22), 0, 0), mats["wood_pianoblack"], vertices=24, bevel=0.002)
    for b_idx in [-0.03, 0.0, 0.03]:
        make_torus(f"{name}_Bellows_{b_idx}", (lx, ly + b_idx * 0.8, lz + b_idx * 0.3), 0.043, 0.005, (math.radians(-22), 0, 0), mats["leather_ebony"], major_segments=24, minor_segments=8)
    for side, sx in [("L", -0.052), ("R", 0.052)]:
        make_cylinder(f"{name}_StalkCollar_{side}", (lx + sx, ly + 0.01, lz), 0.012, 0.018, (0, math.radians(90), 0), mats["metal_brushed"], vertices=16)
        make_torus(f"{name}_StalkDetent_{side}", (lx + sx, ly + 0.01, lz), 0.013, 0.002, (0, math.radians(90), 0), mats["ambient_iceblue"], major_segments=16, minor_segments=6)

# 7. B-Pillar Seatbelt Height Adjuster
def make_b_pillar_seatbelt_height_adjuster(name, location, rot_euler=(0, 0, 0), mats=None):
    lx, ly, lz = location
    make_box(f"{name}_TrackPlate", (lx, ly, lz), (0.022, 0.032, 0.11), mats["wood_pianoblack"], bevel=0.002)
    for d_idx in range(5):
        dz = lz - 0.04 + d_idx * 0.020
        make_box(f"{name}_Detent_{d_idx+1}", (lx + 0.008, ly, dz), (0.004, 0.018, 0.005), mats["metal_brushed"], bevel=0.0005)
    make_box(f"{name}_SliderBlock", (lx + 0.012, ly, lz), (0.024, 0.028, 0.032), mats["metal_brushed"], bevel=0.002)
    make_box(f"{name}_ReleaseBtn", (lx + 0.022, ly, lz), (0.006, 0.018, 0.014), mats["chrome_jewel"], bevel=0.001)
    make_torus(f"{name}_DRing", (lx + 0.026, ly, lz - 0.018), 0.016, 0.003, (0, math.radians(90), 0), mats["chrome_jewel"], major_segments=20, minor_segments=8)

# 8. Door Pocket Waterfall Ambient Guide
def make_door_pocket_waterfall_ambient_guide(name, location, length=0.34, rot_euler=(0, 0, 0), mats=None):
    lx, ly, lz = location
    make_box(f"{name}_PocketLip", (lx, ly, lz), (0.045, length, 0.065), mats["leather_ebony"], bevel=0.005)
    make_cylinder(f"{name}_LightGuide", (lx - 0.018, ly, lz + 0.026), 0.0025, length * 0.90, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=12)
    make_box(f"{name}_RubberMat", (lx, ly, lz - 0.028), (0.038, length * 0.92, 0.004), mats["rubber_traction"], bevel=0.001)

# 9. Footwell Night Navigation Gooseneck
def make_footwell_night_navigation_gooseneck(name, location, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_BaseMount", (lx, ly, lz), 0.016, 0.006, (0, 0, 0), mats["billet_aluminum"], vertices=16)
    for g_idx in range(4):
        gz = lz + 0.01 + g_idx * 0.018
        gx = lx + g_idx * 0.006
        make_cylinder(f"{name}_GooseSegment_{g_idx+1}", (gx, ly, gz), 0.004, 0.018, (0, math.radians(12), 0), mats["braided_steel"], vertices=12)
    head_pos = (lx + 0.024, ly, lz + 0.085)
    make_cone(f"{name}_LampHead", head_pos, 0.012, 0.006, 0.024, (0, math.radians(60), 0), mats["billet_aluminum"], vertices=16)
    make_cylinder(f"{name}_RedLens", (head_pos[0] + 0.010, head_pos[1], head_pos[2] - 0.006), 0.008, 0.002, (0, math.radians(60), 0), mats["anodized_red"], vertices=12)

# 10. Rear VIP Refrigerated Bar Cabinet
def make_rear_vip_refrigerated_bar_cabinet(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_Cabinet", (lx, ly, lz), (0.18, 0.22, 0.24), mats["wood_walnut"], bevel=0.005)
    make_box(f"{name}_GlassDoor", (lx, ly + 0.11, lz), (0.17, 0.008, 0.23), mats["glass_clear"], bevel=0.001)
    make_box(f"{name}_DoorTrim", (lx, ly + 0.112, lz), (0.174, 0.004, 0.234), mats["chrome_jewel"], bevel=0.001)
    make_box(f"{name}_Chamber", (lx, ly, lz), (0.15, 0.18, 0.20), mats["metal_brushed"], bevel=0.002)
    for b_x in [-0.045, 0.045]:
        make_cylinder(f"{name}_BottleCradle_{b_x}", (lx + b_x, ly - 0.02, lz - 0.05), 0.038, 0.14, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=20)
    make_box(f"{name}_TempDisplay", (lx, ly + 0.114, lz + 0.09), (0.040, 0.002, 0.016), mats["wood_pianoblack"], bevel=0.0005)
    make_box(f"{name}_TempLED", (lx, ly + 0.115, lz + 0.09), (0.032, 0.001, 0.010), mats["ambient_iceblue"], bevel=0)

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = create_interior_material_suite()
    print(f"[TEST] Materials suite loaded: {len(mats)} materials.")

    make_hydraulic_handbrake_assembly("Test_Handbrake", (0.0, 0.0, 0.0), mats=mats)
    make_augmented_reality_hud_collimator("Test_HUD", (0.3, 0.0, 0.0), mats=mats)
    make_tourbillon_multi_axis_escapement("Test_Tourbillon", (0.6, 0.0, 0.0), mats=mats)
    make_haptic_rotary_command_dial("Test_CommandDial", (0.9, 0.0, 0.0), mats=mats)
    make_3d_knitted_perforated_seat_accent("Test_SeatAccent", (1.2, 0.0, 0.0), mats=mats)
    make_steering_column_telescopic_shroud("Test_SteeringShroud", (1.5, 0.0, 0.0), mats=mats)
    make_b_pillar_seatbelt_height_adjuster("Test_SeatbeltAdjuster", (1.8, 0.0, 0.0), mats=mats)
    make_door_pocket_waterfall_ambient_guide("Test_WaterfallGuide", (2.1, 0.0, 0.0), mats=mats)
    make_footwell_night_navigation_gooseneck("Test_Gooseneck", (2.4, 0.0, 0.0), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("Test_RefrigeratedBar", (2.7, 0.0, 0.0), mats=mats)

    obj_count = len(bpy.data.objects)
    mesh_count = len(bpy.data.meshes)
    print(f"[SUCCESS] All 10 v13.0 CAD primitives instantiated successfully!")
    print(f"Total objects created: {obj_count}, meshes: {mesh_count}")

if __name__ == "__main__":
    main()
