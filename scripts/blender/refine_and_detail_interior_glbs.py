"""
==============================================================================
AUTOMOTIVE INTERIOR GLB REFINEMENT & DETAIL ENHANCEMENT ENGINE v6.0 MASTER CAD EDITION
==============================================================================
Loads, enriches, physically shades, and exports all 29 interior GLB assets in
'public/models/interior/' with ultra-fidelity Class-A automotive CAD craftsmanship:
- Multi-tier French-stitched leather cowls with edge bevels catching specular highlights
- Precision HVAC registers with directional louvers, sliders & rotary airflow thumbwheels
- Diamond-knurled jewel rotary controllers, PRND indicators & electronic monostable shifters
- Ergonomic multi-contour seats with tuck-and-roll cushion flutes, lumbar wings & 22-way controls
- Stalk-mounted seatbelt receiver buckles with red release buttons
- Sculpted steering wheels with true 3D torus rims, anatomical thumb rests & column stalks
- Floor-mounted organ pedals with return springs, pushrods & dimpled dead pedals
- Acoustic laser-drilled speaker grilles, door lock pins & ambient LED lightguides
- Full cabin assembly harmonization with zero-offset spatial alignment
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import random
import time
import shutil
from mathutils import Vector, Matrix, Euler

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
INTERIOR_DIR = os.path.join(PROJECT_DIR, "public", "models", "interior")

def set_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def get_or_create_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0, sheen=0.0):
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

def create_interior_material_suite():
    mats = {}
    # Leathers
    mats["leather_ebony"] = get_or_create_material("Int_Leather_Nappa_Ebony", (0.035, 0.035, 0.04, 1.0), roughness=0.58)
    mats["leather_cognac"] = get_or_create_material("Int_Leather_Nappa_Cognac", (0.42, 0.20, 0.08, 1.0), roughness=0.60)
    mats["leather_beige"] = get_or_create_material("Int_Leather_Nappa_Beige", (0.72, 0.65, 0.55, 1.0), roughness=0.64)
    mats["leather_perforated"] = get_or_create_material("Int_Leather_Perforated", (0.04, 0.04, 0.045, 1.0), roughness=0.70)
    mats["alcantara_charcoal"] = get_or_create_material("Int_Alcantara_Anthracite", (0.05, 0.05, 0.055, 1.0), roughness=0.88)
    mats["stitch_contrast"] = get_or_create_material("Int_Stitch_Contrast_Thread", (0.92, 0.85, 0.70, 1.0), roughness=0.50)

    # Woods & Composites
    mats["wood_walnut"] = get_or_create_material("Int_Wood_OpenPore_Walnut", (0.24, 0.13, 0.07, 1.0), roughness=0.32, clearcoat=0.35)
    mats["wood_pianoblack"] = get_or_create_material("Int_Wood_Piano_Black", (0.012, 0.012, 0.015, 1.0), roughness=0.03, clearcoat=1.0)
    mats["carbon_twill"] = get_or_create_material("Int_Carbon_Twill_3K", (0.04, 0.04, 0.045, 1.0), metallic=0.35, roughness=0.12, clearcoat=1.0)
    mats["carbon_forged"] = get_or_create_material("Int_Carbon_Forged_Satin", (0.06, 0.06, 0.065, 1.0), metallic=0.25, roughness=0.28)

    # Metals & Jewelry
    mats["metal_brushed"] = get_or_create_material("Int_Metal_Brushed_Aluminum", (0.82, 0.83, 0.85, 1.0), metallic=0.94, roughness=0.20)
    mats["chrome_jewel"] = get_or_create_material("Int_Chrome_Jewel_Cut", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.02, clearcoat=1.0)
    mats["anodized_red"] = get_or_create_material("Int_Anodized_Racing_Red", (0.92, 0.08, 0.12, 1.0), metallic=0.88, roughness=0.18, clearcoat=0.8)
    mats["anodized_gold"] = get_or_create_material("Int_Anodized_Gold_Trim", (0.88, 0.72, 0.18, 1.0), metallic=0.90, roughness=0.22)
    mats["titanium_finish"] = get_or_create_material("Int_Titanium_Satin", (0.55, 0.58, 0.62, 1.0), metallic=0.95, roughness=0.25)

    # Screens & Ambient Lights
    mats["screen_oled"] = get_or_create_material("Int_Screen_OLED_Emissive", (0.02, 0.08, 0.22, 1.0), emission=(0.10, 0.35, 0.85, 1.0), emission_strength=6.0)
    mats["screen_ui_gauge"] = get_or_create_material("Int_Screen_UI_Gauge_Cyan", (0.02, 0.25, 0.40, 1.0), emission=(0.10, 0.75, 1.0, 1.0), emission_strength=12.0)
    mats["ambient_iceblue"] = get_or_create_material("Int_Ambient_LED_IceBlue", (0.15, 0.75, 1.0, 1.0), emission=(0.15, 0.75, 1.0, 1.0), emission_strength=22.0)
    mats["ambient_amber"] = get_or_create_material("Int_Ambient_LED_Amber", (1.0, 0.55, 0.05, 1.0), emission=(1.0, 0.55, 0.05, 1.0), emission_strength=22.0)
    mats["ambient_green"] = get_or_create_material("Int_Ambient_LED_Green", (0.05, 1.0, 0.35, 1.0), emission=(0.05, 1.0, 0.35, 1.0), emission_strength=22.0)
    mats["starlight_star"] = get_or_create_material("Int_Starlight_Fiber_Optic", (0.95, 0.98, 1.0, 1.0), emission=(0.95, 0.98, 1.0, 1.0), emission_strength=35.0)

    # Functional Materials
    mats["rubber_traction"] = get_or_create_material("Int_Rubber_Ribbed_Traction", (0.03, 0.03, 0.035, 1.0), roughness=0.85)
    mats["carpet_tufted"] = get_or_create_material("Int_Carpet_Tufted_Dark", (0.04, 0.04, 0.045, 1.0), roughness=0.94)
    mats["glass_clear"] = get_or_create_material("Int_Glass_Optical_Clear", (0.95, 0.98, 1.0, 0.25), roughness=0.01, transmission=0.98, ior=1.52, alpha=0.25)
    mats["harness_red"] = get_or_create_material("Int_Racing_Harness_Red", (0.90, 0.04, 0.05, 1.0), roughness=0.60)
    mats["seatbelt_red_button"] = get_or_create_material("Int_Seatbelt_Red_Button", (0.95, 0.05, 0.08, 1.0), roughness=0.35)
    mats["seatbelt_webbing"] = get_or_create_material("Int_Seatbelt_Woven_Nylon", (0.07, 0.07, 0.08, 1.0), roughness=0.55, sheen=0.25)
    mats["chrono_needle"] = get_or_create_material("Int_Chrono_Needle_Red", (0.95, 0.04, 0.04, 1.0), roughness=0.18, emission=(0.95, 0.04, 0.04, 1.0), emission_strength=4.0)
    mats["screen_passenger"] = get_or_create_material("Int_Screen_Passenger_OLED", (0.02, 0.05, 0.12, 1.0), emission=(0.06, 0.20, 0.45, 1.0), emission_strength=5.0)
    mats["billet_aluminum"] = get_or_create_material("Int_Billet_Raw_Aluminum", (0.88, 0.88, 0.90, 1.0), metallic=0.96, roughness=0.15)
    mats["fluid_sight"] = get_or_create_material("Int_Fluid_Sight_Glass", (0.85, 0.70, 0.35, 0.6), roughness=0.15, transmission=0.80, ior=1.45, alpha=0.6)
    mats["door_reflector"] = get_or_create_material("Int_Safety_Reflector_Red", (0.90, 0.02, 0.02, 1.0), roughness=0.20, clearcoat=0.8)
    mats["piping_cognac"] = get_or_create_material("Int_Leather_Piping_Cognac", (0.62, 0.38, 0.22, 1.0), roughness=0.38)
    mats["stripe_yellow"] = get_or_create_material("Int_Centering_Stripe_Yellow", (0.98, 0.85, 0.05, 1.0), roughness=0.30)
    mats["leather_navy"] = get_or_create_material("Int_Leather_Nappa_Navy", (0.03, 0.05, 0.12, 1.0), roughness=0.55)
    mats["wood_burl"] = get_or_create_material("Int_Wood_Burl_Ash", (0.28, 0.16, 0.09, 1.0), roughness=0.18, clearcoat=0.85)
    mats["coolsuit_blue"] = get_or_create_material("Int_Coolsuit_Hose_Blue", (0.05, 0.35, 0.85, 1.0), roughness=0.35)
    mats["shift_led_magenta"] = get_or_create_material("Int_Shift_LED_Magenta", (0.95, 0.05, 0.75, 1.0), emission=(0.95, 0.05, 0.75, 1.0), emission_strength=25.0)
    mats["an_fitting_blue"] = get_or_create_material("Int_AN_Fitting_Blue", (0.05, 0.22, 0.88, 1.0), metallic=0.92, roughness=0.18, clearcoat=0.85)
    mats["braided_steel"] = get_or_create_material("Int_Braided_Stainless_Steel", (0.75, 0.77, 0.80, 1.0), metallic=0.92, roughness=0.35)
    mats["leather_oxblood"] = get_or_create_material("Int_Leather_Oxblood", (0.32, 0.05, 0.08, 1.0), roughness=0.55)
    mats["screen_hud_amber"] = get_or_create_material("Int_HUD_Projection_Amber", (1.0, 0.70, 0.10, 1.0), emission=(1.0, 0.70, 0.10, 1.0), emission_strength=18.0)
    mats["rubber_inductive"] = get_or_create_material("Int_Rubber_Inductive_Pad", (0.025, 0.025, 0.03, 1.0), roughness=0.82)
    mats["led_charge_amber"] = get_or_create_material("Int_LED_Charge_Amber", (1.0, 0.60, 0.05, 1.0), emission=(1.0, 0.60, 0.05, 1.0), emission_strength=18.0)
    mats["led_charge_cyan"] = get_or_create_material("Int_LED_Charge_Cyan", (0.10, 0.85, 1.0, 1.0), emission=(0.10, 0.85, 1.0, 1.0), emission_strength=18.0)
    mats["flip_guard_red"] = get_or_create_material("Int_Flip_Guard_Anodized_Red", (0.85, 0.05, 0.08, 1.0), metallic=0.92, roughness=0.22, clearcoat=0.9)
    mats["lens_map_lamp"] = get_or_create_material("Int_Lens_Map_Lamp", (0.95, 0.98, 1.0, 0.4), roughness=0.10, transmission=0.85, ior=1.49, alpha=0.4)
    mats["brass_brushed"] = get_or_create_material("Int_Brass_Brushed_Bespoke", (0.85, 0.70, 0.35, 1.0), metallic=0.92, roughness=0.25)
    mats["crystal_faceted"] = get_or_create_material("Int_Crystal_Faceted_Jewel", (0.92, 0.96, 1.0, 0.35), roughness=0.03, clearcoat=1.0, transmission=0.92, ior=1.65, alpha=0.35)
    mats["chrome_satin"] = get_or_create_material("Int_Chrome_Satin_Electroplate", (0.88, 0.89, 0.91, 1.0), metallic=0.95, roughness=0.12)
    mats["mirror_electrochromic"] = get_or_create_material("Int_Mirror_Electrochromic", (0.82, 0.88, 0.95, 1.0), metallic=0.98, roughness=0.02, clearcoat=1.0)
    mats["gold_rose"] = get_or_create_material("Int_Gold_Rose_18K", (0.92, 0.68, 0.60, 1.0), metallic=0.98, roughness=0.14)
    mats["acoustic_silk_mesh"] = get_or_create_material("Int_Acoustic_Silk_Mesh", (0.03, 0.03, 0.035, 1.0), roughness=0.88, sheen=0.8)
    mats["safety_webbing_blue"] = get_or_create_material("Int_Safety_Webbing_Blue", (0.06, 0.18, 0.85, 1.0), roughness=0.60, sheen=0.35)
    mats["carpet_velour"] = get_or_create_material("Int_Carpet_Velour_Deep", (0.04, 0.045, 0.05, 1.0), roughness=0.92)
    mats["chilled_ice_blue"] = get_or_create_material("Int_Thermo_Chilled_IceBlue", (0.10, 0.60, 1.0, 1.0), emission=(0.10, 0.60, 1.0, 1.0), emission_strength=20.0)
    mats["heated_amber_red"] = get_or_create_material("Int_Thermo_Heated_AmberRed", (1.0, 0.20, 0.05, 1.0), emission=(1.0, 0.20, 0.05, 1.0), emission_strength=20.0)
    mats["foam_sfi_safety"] = get_or_create_material("Int_RollCage_Safety_Foam", (0.08, 0.08, 0.09, 1.0), roughness=0.95)

    # v12.0 Master Horological & Bespoke Materials
    mats["titanium_anodized_gold"] = get_or_create_material("Int_Titanium_Anodized_Gold", (0.88, 0.72, 0.42, 1.0), metallic=0.92, roughness=0.22)
    mats["carbon_forged_marbled"] = get_or_create_material("Int_Carbon_Forged_Marbled", (0.035, 0.035, 0.04, 1.0), metallic=0.15, roughness=0.18, clearcoat=1.0)
    mats["harness_nylon_red"] = get_or_create_material("Int_Racing_Harness_Nylon_Red", (0.75, 0.05, 0.05, 1.0), roughness=0.75, sheen=0.4)
    mats["fire_bottle_gloss_red"] = get_or_create_material("Int_FireBottle_Gloss_Red", (0.85, 0.03, 0.02, 1.0), metallic=0.05, roughness=0.12, clearcoat=1.0)
    mats["champagne_crystal"] = get_or_create_material("Int_Champagne_Flute_Crystal", (0.95, 0.98, 1.0, 0.2), roughness=0.02, transmission=0.96, ior=1.54, alpha=0.2)
    mats["brass_watchmaker"] = get_or_create_material("Int_Brass_Watchmaker_Polished", (0.90, 0.75, 0.35, 1.0), metallic=0.95, roughness=0.22)
    mats["harness_camlock_red"] = get_or_create_material("Int_Harness_Camlock_Red", (0.92, 0.08, 0.10, 1.0), metallic=0.85, roughness=0.20)
    mats["safety_tag_yellow"] = get_or_create_material("Int_FIA_Safety_Tag_Yellow", (0.95, 0.88, 0.10, 1.0), roughness=0.80)

    # v13.0 Ultimate Haute Horlogerie & Aerospace Materials
    mats["synthetic_ruby"] = get_or_create_material("Int_Synthetic_Ruby_Corundum", (0.88, 0.02, 0.12, 0.85), roughness=0.01, transmission=0.94, ior=1.77, alpha=0.85)
    mats["anodized_petrol_blue"] = get_or_create_material("Int_Anodized_Petrol_Blue", (0.03, 0.28, 0.45, 1.0), metallic=0.92, roughness=0.18, clearcoat=0.85)
    mats["leather_semi_aniline_saddle"] = get_or_create_material("Int_Leather_Saddle_Tan", (0.58, 0.34, 0.18, 1.0), roughness=0.58, sheen=0.35)
    mats["damascus_steel"] = get_or_create_material("Int_Damascus_Steel_Layered", (0.35, 0.36, 0.38, 1.0), metallic=0.96, roughness=0.22)
    mats["hud_projection_cyan"] = get_or_create_material("Int_HUD_Projection_Cyan", (0.10, 0.90, 1.0, 0.90), emission=(0.10, 0.90, 1.0, 1.0), emission_strength=30.0, transmission=0.95, alpha=0.90)
    mats["hydraulic_fluid_amber"] = get_or_create_material("Int_Hydraulic_DOT5_Amber", (0.92, 0.72, 0.20, 0.55), roughness=0.08, transmission=0.88, ior=1.43, alpha=0.55)
    mats["copper_woven_mesh"] = get_or_create_material("Int_Copper_Woven_Mesh", (0.85, 0.48, 0.28, 1.0), metallic=0.98, roughness=0.30)
    mats["carbon_matte_dry"] = get_or_create_material("Int_Carbon_Matte_Dry", (0.04, 0.04, 0.045, 1.0), metallic=0.15, roughness=0.42)

    # v14.0 Ultimate Bespoke Hyper-Luxury & Motorsport Aero-Craftsmanship Materials
    mats["pdlc_smart_glass"] = get_or_create_material("Int_PDLC_Smart_Glass", (0.05, 0.08, 0.12, 0.35), roughness=0.03, transmission=0.82, ior=1.54, alpha=0.35)
    mats["brushed_rose_gold"] = get_or_create_material("Int_Brushed_Rose_Gold_Bespoke", (0.95, 0.72, 0.65, 1.0), metallic=0.98, roughness=0.20)
    mats["chilled_aluminum"] = get_or_create_material("Int_Chilled_BeadBlasted_Alu", (0.78, 0.82, 0.85, 1.0), metallic=0.98, roughness=0.35)
    mats["neon_yellow_accent"] = get_or_create_material("Int_Neon_Acid_Yellow_Race", (0.85, 0.98, 0.05, 1.0), roughness=0.25, emission=(0.85, 0.98, 0.05, 1.0), emission_strength=12.0)
    mats["coiled_wire_polyurethane"] = get_or_create_material("Int_Coiled_Wire_Polyurethane", (0.05, 0.05, 0.05, 1.0), roughness=0.38)
    mats["optical_lens_coated"] = get_or_create_material("Int_Optical_Lens_Coated_Violet", (0.92, 0.88, 0.98, 0.2), roughness=0.01, transmission=0.95, ior=1.62, alpha=0.2)
    mats["porcelain_ceramic_white"] = get_or_create_material("Int_Porcelain_Ceramic_White", (0.96, 0.96, 0.95, 1.0), roughness=0.04, clearcoat=1.0)
    mats["damascus_rose_accent"] = get_or_create_material("Int_Damascus_Rose_Steel", (0.45, 0.35, 0.35, 1.0), metallic=0.94, roughness=0.24)

    return mats

def reset_scene_and_get_mats():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return create_interior_material_suite()

def make_box(name, location, size, mat, bevel=0.003, segments=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0 and min(size) > bevel * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, min(size) * 0.25)
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, mat, vertices=32, bevel=0.002):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and depth > bevel * 2.5 and radius > bevel * 2.5:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, radius * 0.2)
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(45)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_torus(name, location, major_radius, minor_radius, rot_euler, mat, major_segments=48, minor_segments=24):
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

def make_spring_coil(name, location, radius, pitch, turns, wire_r, rot_euler, mat=None, segments_per_turn=16, wire_segments=8):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    total_steps = int(turns * segments_per_turn)
    rings = []
    half_len = (total_steps * (pitch / segments_per_turn)) / 2.0
    
    for s in range(total_steps + 1):
        theta = s * (2.0 * math.pi / segments_per_turn)
        cz = s * (pitch / segments_per_turn) - half_len
        cx = radius * math.cos(theta)
        cy = radius * math.sin(theta)
        center = Vector((cx, cy, cz))
        
        tx = -radius * math.sin(theta)
        ty = radius * math.cos(theta)
        tz = pitch / (2.0 * math.pi)
        tangent = Vector((tx, ty, tz)).normalized()
        
        radial = Vector((math.cos(theta), math.sin(theta), 0.0)).normalized()
        binormal = tangent.cross(radial).normalized()
        
        ring_verts = []
        for w in range(wire_segments):
            phi = w * (2.0 * math.pi / wire_segments)
            offset = (radial * math.cos(phi) + binormal * math.sin(phi)) * wire_r
            vert = bm.verts.new(center + offset)
            ring_verts.append(vert)
        rings.append(ring_verts)
        
    bm.verts.ensure_lookup_table()
    for s in range(total_steps):
        r0 = rings[s]
        r1 = rings[s + 1]
        for w in range(wire_segments):
            w_next = (w + 1) % wire_segments
            bm.faces.new([r0[w], r1[w], r1[w_next], r0[w_next]])
            
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    
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

def make_hex_bolt(name, location, radius, depth, rot_euler, mat=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_pill_cylinder(name, location, radius, length, rot_euler, mat=None, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if length > radius * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = radius * 0.95
        bev.segments = 4
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_gusset_bracket(name, location, size, hole_radius, rot_euler, mat=None):
    plate = make_box(name, location, size, mat, bevel=0.002, segments=2)
    if hole_radius > 0:
        hole_depth = max(size) * 1.5
        make_cylinder(f"{name}_Hole", location, hole_radius, hole_depth, (math.radians(90), 0, 0), mat, vertices=20)
    return plate

def make_an_fitting(name, location, radius, length, rot_euler, mat_hex, mat_collar, mat_line=None):
    hex_nut = make_hex_bolt(f"{name}_Hex", location, radius * 1.35, length * 0.45, rot_euler, mat_hex)
    collar = make_cylinder(f"{name}_Collar", (location[0], location[1] + length * 0.25, location[2]), radius * 1.10, length * 0.35, rot_euler, mat_collar, vertices=20, bevel=0.001)
    if mat_line:
        make_cylinder(f"{name}_Hose", (location[0], location[1] + length * 0.70, location[2]), radius * 0.90, length * 0.75, rot_euler, mat_line, vertices=16)
    return hex_nut

def make_skeletonized_paddle(name, location, size, rot_euler, mat_paddle, mat_accent, symbol="+"):
    pw, pd, ph = size
    blade = make_box(f"{name}_Blade", location, size, mat_paddle, bevel=0.002)
    make_box(f"{name}_Slot", (location[0], location[1], location[2] - ph * 0.12), (pw * 0.35, pd * 1.2, ph * 0.38), mat_accent, bevel=0.001)
    if symbol == "+":
        make_box(f"{name}_SymH", (location[0], location[1] - pd * 0.52, location[2] + ph * 0.28), (pw * 0.45, pd * 0.15, pw * 0.10), mat_accent, bevel=0)
        make_box(f"{name}_SymV", (location[0], location[1] - pd * 0.52, location[2] + ph * 0.28), (pw * 0.10, pd * 0.15, pw * 0.45), mat_accent, bevel=0)
    elif symbol == "-":
        make_box(f"{name}_SymH", (location[0], location[1] - pd * 0.52, location[2] + ph * 0.28), (pw * 0.45, pd * 0.15, pw * 0.10), mat_accent, bevel=0)
    return blade

def make_swiss_chronograph(name, location, radius, depth, rot_euler, mats, ridges=32):
    casing = make_knurled_cylinder(f"{name}_Bezel", location, radius, depth, rot_euler, mats["chrome_jewel"], ridges=ridges)
    face = make_cylinder(f"{name}_Face", (location[0], location[1] - depth * 0.12, location[2]), radius * 0.88, depth * 0.25, rot_euler, mats["wood_pianoblack"], vertices=40)
    pinion = make_cylinder(f"{name}_Pinion", (location[0], location[1] - depth * 0.28, location[2]), radius * 0.08, depth * 0.12, rot_euler, mats["chrome_jewel"], vertices=16)
    make_box(f"{name}_HourHand", (location[0] - radius * 0.18, location[1] - depth * 0.32, location[2] + radius * 0.12), (radius * 0.42, depth * 0.04, radius * 0.06), mats["anodized_gold"], bevel=0)
    make_box(f"{name}_MinHand", (location[0] + radius * 0.08, location[1] - depth * 0.32, location[2] + radius * 0.30), (radius * 0.05, depth * 0.04, radius * 0.65), mats["anodized_gold"], bevel=0)
    make_box(f"{name}_SecHand", (location[0] - radius * 0.04, location[1] - depth * 0.34, location[2] - radius * 0.20), (radius * 0.025, depth * 0.03, radius * 0.70), mats["chrono_needle"], bevel=0)
    for s_side, s_x in [("L", -radius * 0.40), ("R", radius * 0.40)]:
        make_cylinder(f"{name}_Subdial_{s_side}", (location[0] + s_x, location[1] - depth * 0.22, location[2]), radius * 0.22, depth * 0.06, rot_euler, mats["metal_brushed"], vertices=24)
        make_box(f"{name}_Subhand_{s_side}", (location[0] + s_x, location[1] - depth * 0.26, location[2]), (radius * 0.02, depth * 0.02, radius * 0.16), mats["chrono_needle"], bevel=0)
    make_knurled_cylinder(f"{name}_Crown", (location[0] + radius * 1.05, location[1], location[2]), radius * 0.20, depth * 0.35, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=16)
    for p_i, p_ang in enumerate([-math.pi/5, math.pi/5]):
        px = location[0] + radius * 1.02 * math.cos(p_ang)
        pz = location[2] + radius * 1.02 * math.sin(p_ang)
        make_cylinder(f"{name}_Pusher_{p_i+1}", (px, location[1], pz), radius * 0.12, depth * 0.30, rot_euler, mats["metal_brushed"], vertices=16)
    make_cylinder(f"{name}_GlassLens", (location[0], location[1] - depth * 0.36, location[2]), radius * 0.90, depth * 0.05, rot_euler, mats["glass_clear"], vertices=36)
    return casing

def make_open_gate_shifter(name, location, size, mats, current_gear=3):
    gw, gd, gh = size
    base = make_box(f"{name}_Housing", location, (gw, gd, gh * 0.4), mats["metal_brushed"], bevel=0.003)
    gate_plate = make_box(f"{name}_GatePlate", (location[0], location[1], location[2] + gh * 0.2), (gw * 0.92, gd * 0.92, 0.006), mats["chrome_jewel"], bevel=0.001)
    
    slot_d = gd * 0.72
    slot_w = 0.008
    make_box(f"{name}_Slot_Center", (location[0], location[1], location[2] + gh * 0.204), (gw * 0.68, slot_w, 0.004), mats["wood_pianoblack"], bevel=0)
    for slot_i, sx in enumerate([-gw * 0.26, 0.0, gw * 0.26]):
        make_box(f"{name}_Slot_Leg_{slot_i+1}", (location[0] + sx, location[1], location[2] + gh * 0.204), (slot_w, slot_d, 0.004), mats["wood_pianoblack"], bevel=0)
    make_box(f"{name}_Slot_Rev", (location[0] - gw * 0.34, location[1] - slot_d * 0.35, location[2] + gh * 0.204), (gw * 0.16, slot_w, 0.004), mats["wood_pianoblack"], bevel=0)
    
    shaft_len = gh * 1.8
    shifter_x = location[0]
    shifter_y = location[1] + (slot_d * 0.35 if current_gear % 2 != 0 else -slot_d * 0.35)
    make_cylinder(f"{name}_Shaft", (shifter_x, shifter_y, location[2] + gh * 0.2 + shaft_len * 0.45), 0.006, shaft_len, (0, 0, 0), mats["chrome_jewel"], vertices=20)
    make_knurled_cylinder(f"{name}_Reverse_Collar", (shifter_x, shifter_y, location[2] + gh * 0.2 + shaft_len * 0.65), 0.010, 0.018, (0, 0, 0), mats["metal_brushed"], ridges=18)
    make_cylinder(f"{name}_Knob", (shifter_x, shifter_y, location[2] + gh * 0.2 + shaft_len * 0.95), 0.022, 0.038, (0, 0, 0), mats["chrome_jewel"], vertices=32, bevel=0.014)
    make_cylinder(f"{name}_Knob_Emblem", (shifter_x, shifter_y, location[2] + gh * 0.2 + shaft_len * 0.95 + 0.020), 0.012, 0.002, (0, 0, 0), mats["anodized_red"], vertices=24)
    
    make_spring_coil(f"{name}_Spring_L", (location[0] - 0.022, location[1], location[2] + gh * 0.08), 0.008, 0.004, 5, 0.0014, (0, math.radians(90), 0), mats["metal_brushed"])
    make_spring_coil(f"{name}_Spring_R", (location[0] + 0.022, location[1], location[2] + gh * 0.08), 0.008, 0.004, 5, 0.0014, (0, math.radians(90), 0), mats["metal_brushed"])
    return base

def make_rotary_dial_with_oled(name, location, radius, depth, rot_euler, mats, display_mat=None, ridges=24):
    if not display_mat:
        display_mat = mats["screen_oled"]
    outer_bezel = make_knurled_cylinder(f"{name}_Outer_Ring", location, radius, depth, rot_euler, mats["chrome_jewel"], ridges=ridges)
    make_cylinder(f"{name}_Inner_Chamfer", (location[0], location[1] - depth * 0.15, location[2]), radius * 0.88, depth * 0.3, rot_euler, mats["metal_brushed"], vertices=24, bevel=0.001)
    make_cylinder(f"{name}_OLED_Core", (location[0], location[1] - depth * 0.28, location[2]), radius * 0.76, depth * 0.12, rot_euler, display_mat, vertices=24)
    make_torus(f"{name}_Status_Arc", (location[0], location[1] - depth * 0.32, location[2]), radius * 0.68, 0.0018, rot_euler, mats["ambient_iceblue"], major_segments=20, minor_segments=4)
    return outer_bezel

def make_speaker_acoustic_grille(name, location, radius, depth, rot_euler, mats, rings=3):
    bezel = make_cylinder(f"{name}_Bezel", location, radius, depth, rot_euler, mats["metal_brushed"], vertices=24, bevel=0.002)
    make_torus(f"{name}_Ambient_Halo", (location[0], location[1] - depth * 0.10, location[2]), radius * 1.02, 0.0025, rot_euler, mats["ambient_iceblue"], major_segments=24, minor_segments=4)
    for r_i in range(rings):
        r_rad = radius * (0.35 + r_i * 0.22)
        make_torus(f"{name}_Dispersion_Ring_{r_i+1}", (location[0], location[1] - depth * 0.25, location[2]), r_rad, 0.0018, rot_euler, mats["wood_pianoblack"], major_segments=20, minor_segments=4)
    make_cylinder(f"{name}_Phase_Plug", (location[0], location[1] - depth * 0.30, location[2]), radius * 0.18, depth * 0.20, rot_euler, mats["chrome_jewel"], vertices=16, bevel=0.001)
    return bezel

def make_seatbelt_height_adjuster(name, location, length, mats, sign=1):
    inward = -1 if sign >= 0 else 1
    track = make_box(f"{name}_Track", location, (0.012, 0.035, length), mats["titanium_finish"], bevel=0.001)
    make_box(f"{name}_Slider", (location[0] + inward * 0.004, location[1], location[2] + length * 0.15), (0.016, 0.042, 0.038), mats["leather_ebony"], bevel=0.002)
    make_box(f"{name}_Btn", (location[0] + inward * 0.012, location[1], location[2] + length * 0.15), (0.004, 0.022, 0.014), mats["chrome_jewel"], bevel=0.001)
    make_torus(f"{name}_D_Ring", (location[0] + inward * 0.016, location[1], location[2] + length * 0.15 - 0.022), 0.018, 0.0035, (0, math.radians(90), 0), mats["chrome_jewel"], major_segments=16, minor_segments=4)
    make_box(f"{name}_Webbing_Loop", (location[0] + inward * 0.016, location[1], location[2] + length * 0.15 - 0.05), (0.003, 0.045, 0.08), mats["seatbelt_webbing"], bevel=0.001)
    return track

def make_deployable_cupholder(name, location, radius, depth, mats):
    well = make_cylinder(f"{name}_Well", location, radius, depth, (0, 0, 0), mats["rubber_traction"], vertices=24)
    make_cylinder(f"{name}_Peltier", (location[0], location[1], location[2] - depth * 0.45), radius * 0.85, depth * 0.08, (0, 0, 0), mats["metal_brushed"], vertices=16)
    make_cylinder(f"{name}_Halo", (location[0], location[1], location[2] + depth * 0.48), radius * 1.04, 0.004, (0, 0, 0), mats["ambient_iceblue"], vertices=24)
    for tab_i in range(3):
        ang = tab_i * (2.0 * math.pi / 3.0)
        tx = location[0] + radius * 0.72 * math.cos(ang)
        ty = location[1] + radius * 0.72 * math.sin(ang)
        make_box(f"{name}_Gripper_{tab_i+1}", (tx, ty, location[2] + depth * 0.15), (0.012, 0.012, depth * 0.40), mats["leather_ebony"], bevel=0.001)
        make_cylinder(f"{name}_RubberTip_{tab_i+1}", (tx, ty, location[2] + depth * 0.15), 0.004, depth * 0.35, (0, 0, 0), mats["rubber_traction"], vertices=8)
    return well

def make_hud_glass_projector(name, location, size, mats):
    pw, pd, ph = size
    housing = make_box(f"{name}_Housing", location, size, mats["wood_pianoblack"], bevel=0.004)
    make_box(f"{name}_Cavity", (location[0], location[1], location[2] + 0.005), (pw * 0.88, pd * 0.82, ph * 0.85), mats["rubber_traction"], bevel=0)
    make_cylinder(f"{name}_Lens", (location[0], location[1] + pd * 0.2, location[2] - ph * 0.1), pw * 0.28, 0.006, (math.radians(45), 0, 0), mats["ambient_iceblue"], vertices=28)
    make_box(f"{name}_CombinerGlass", (location[0], location[1] - pd * 0.1, location[2] + ph * 0.8), (pw * 0.85, 0.004, ph * 1.2), mats["glass_clear"], bevel=0.001)
    make_box(f"{name}_Holo_Speed", (location[0] - pw * 0.2, location[1] - pd * 0.1, location[2] + ph * 0.9), (pw * 0.25, 0.002, ph * 0.20), mats["screen_hud_amber"], bevel=0)
    make_box(f"{name}_Holo_Gear", (location[0] + pw * 0.2, location[1] - pd * 0.1, location[2] + ph * 0.9), (pw * 0.15, 0.002, ph * 0.20), mats["screen_hud_amber"], bevel=0)
    return housing

def make_start_stop_button_with_flip_cover(name, location, radius, depth=0.012, rot_euler=(0, 0, 0), mats=None):
    if isinstance(depth, dict):
        mats = depth
        depth = 0.012
        rot_euler = (0, 0, 0)
    elif isinstance(rot_euler, dict):
        mats = rot_euler
        rot_euler = (0, 0, 0)
    escutcheon = make_cylinder(f"{name}_Escutcheon", location, radius * 1.35, depth * 0.4, rot_euler, mats["metal_brushed"], vertices=20, bevel=0.001)
    make_cylinder(f"{name}_Core_Button", location, radius * 0.82, depth * 0.7, rot_euler, mats["anodized_red"], vertices=20, bevel=0.001)
    make_knurled_cylinder(f"{name}_Knurled_Collar", location, radius * 0.94, depth * 0.5, rot_euler, mats["metal_brushed"], ridges=16)
    make_torus(f"{name}_Emissive_Halo", location, radius * 0.98, 0.0018, rot_euler, mats["ambient_amber"], major_segments=16, minor_segments=4)
    pin_y = location[1] + (radius * 1.15 * math.cos(rot_euler[0]) if rot_euler[0] != 0 else radius * 1.15)
    pin_z = location[2] + (radius * 1.15 * math.sin(rot_euler[0]) if rot_euler[0] != 0 else depth * 0.3)
    make_cylinder(f"{name}_Hinge_Pin", (location[0], pin_y, pin_z), 0.0025, radius * 1.5, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=12)
    make_box(f"{name}_Flip_Guard", (location[0], pin_y, pin_z + 0.012), (radius * 1.4, 0.0035, radius * 1.8), mats["flip_guard_red"], bevel=0.001)
    make_box(f"{name}_Guard_Thumb_Groove", (location[0], pin_y, pin_z + 0.016), (radius * 0.65, 0.0042, 0.005), mats["wood_pianoblack"], bevel=0)
    return escutcheon

def make_wireless_charging_pad(name, location, size, mats):
    pw, pd, ph = size
    tray = make_box(f"{name}_Tray", location, size, mats["rubber_inductive"], bevel=0.002)
    for rib_i, rx in enumerate([-pw * 0.30, 0.0, pw * 0.30]):
        make_box(f"{name}_Rib_{rib_i+1}", (location[0] + rx, location[1], location[2] + ph * 0.52), (0.004, pd * 0.72, 0.0025), mats["rubber_traction"], bevel=0.001)
    make_torus(f"{name}_Qi_Coil_Outer", (location[0], location[1], location[2] + ph * 0.53), 0.018, 0.0016, (0, 0, 0), mats["chrome_jewel"], major_segments=16, minor_segments=4)
    make_cylinder(f"{name}_Qi_Coil_Core", (location[0], location[1], location[2] + ph * 0.53), 0.006, 0.002, (0, 0, 0), mats["chrome_jewel"], vertices=12)
    make_box(f"{name}_Status_LED", (location[0], location[1] - pd * 0.40, location[2] + ph * 0.53), (0.018, 0.004, 0.002), mats["led_charge_cyan"], bevel=0.0008)
    return tray

def make_climate_hvac_roller(name, location, radius, width, rot_euler=(0, math.radians(90), 0), mats=None, temp_str="72°F"):
    if isinstance(rot_euler, dict) and mats is None:
        mats = rot_euler
        rot_euler = (0, math.radians(90), 0)
    casing = make_box(f"{name}_Bezel", location, (width * 1.3, radius * 2.4, radius * 2.2), mats["metal_brushed"], bevel=0.002)
    make_knurled_cylinder(f"{name}_Barrel", location, radius, width * 0.82, rot_euler, mats["metal_brushed"], ridges=18)
    make_cylinder(f"{name}_Center_Chrome", location, radius * 1.04, width * 0.15, rot_euler, mats["chrome_jewel"], vertices=20)
    disp_y = location[1] - radius * 1.15 if rot_euler[0] != 0 else location[1]
    disp_z = location[2] + radius * 1.15
    make_box(f"{name}_Temp_Display", (location[0], disp_y, disp_z), (width * 0.75, 0.003, radius * 0.65), mats["screen_oled"], bevel=0.001)
    make_box(f"{name}_Cool_Accent", (location[0] - width * 0.25, disp_y, disp_z + radius * 0.38), (width * 0.4, 0.0035, 0.0018), mats["ambient_iceblue"], bevel=0)
    make_box(f"{name}_Warm_Accent", (location[0] + width * 0.25, disp_y, disp_z + radius * 0.38), (width * 0.4, 0.0035, 0.0018), mats["anodized_red"], bevel=0)
    return casing

def make_overhead_sos_console(name, location, size, mats):
    cw, cd, ch = size
    casing = make_box(f"{name}_Housing", location, size, mats["leather_ebony"], bevel=0.003)
    make_box(f"{name}_SOS_Pocket", (location[0], location[1] - cd * 0.20, location[2] - ch * 0.42), (cw * 0.28, cd * 0.28, 0.006), mats["metal_brushed"], bevel=0.001)
    make_box(f"{name}_SOS_Cover", (location[0], location[1] - cd * 0.20, location[2] - ch * 0.48), (cw * 0.25, cd * 0.24, 0.004), mats["flip_guard_red"], bevel=0.001)
    for lamp_i, lx in enumerate([-cw * 0.32, cw * 0.32]):
        make_cylinder(f"{name}_Map_Lamp_{lamp_i+1}", (location[0] + lx, location[1] - cd * 0.15, location[2] - ch * 0.48), 0.018, 0.004, (0, 0, 0), mats["lens_map_lamp"], vertices=16)
        make_torus(f"{name}_Lamp_Bezel_{lamp_i+1}", (location[0] + lx, location[1] - cd * 0.15, location[2] - ch * 0.48), 0.020, 0.0018, (0, 0, 0), mats["chrome_jewel"], major_segments=16, minor_segments=4)
    make_box(f"{name}_Airbag_Status", (location[0], location[1] + cd * 0.22, location[2] - ch * 0.48), (cw * 0.50, cd * 0.16, 0.003), mats["screen_oled"], bevel=0.001)
    make_box(f"{name}_Mic_Mesh", (location[0], location[1] + cd * 0.38, location[2] - ch * 0.48), (cw * 0.30, cd * 0.08, 0.002), mats["rubber_traction"], bevel=0)
    return casing

def make_isofix_anchor_flap(name, location, size, mats):
    iw, id, ih = size
    housing = make_box(f"{name}_Housing", location, size, mats["leather_ebony"], bevel=0.002)
    make_cylinder(f"{name}_Anchor_Bar", (location[0], location[1] + id * 0.2, location[2]), 0.003, iw * 0.65, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=12)
    make_box(f"{name}_Flap", (location[0], location[1] - id * 0.38, location[2]), (iw * 0.85, 0.003, ih * 0.85), mats["leather_ebony"], bevel=0.001)
    make_box(f"{name}_Pictogram", (location[0], location[1] - id * 0.40, location[2]), (iw * 0.40, 0.0015, ih * 0.45), mats["metal_brushed"], bevel=0)
    return housing

def make_paddle_micro_switch(name, location, size, mats):
    sw, sd, sh = size
    casing = make_box(f"{name}_Housing", location, size, mats["leather_ebony"], bevel=0.001)
    make_cylinder(f"{name}_Plunger", (location[0], location[1] - sd * 0.45, location[2]), 0.0035, 0.006, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)
    make_cylinder(f"{name}_Pivot_Pin", (location[0], location[1], location[2] + sh * 0.38), 0.002, sw * 1.2, (0, math.radians(90), 0), mats["metal_brushed"], vertices=10)
    make_cylinder(f"{name}_Magnet", (location[0], location[1] + sd * 0.40, location[2]), 0.004, 0.002, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=12)
    return casing

def make_precision_turbine_ac_vent(name, location, radius, depth=0.024, rot_euler=(math.radians(90), 0, 0), mats=None, vane_count=8, illuminated=True, bezel_mat=None, core_mat=None):
    if isinstance(depth, dict):
        mats = depth
        depth = 0.024
        rot_euler = (math.radians(90), 0, 0)
    elif isinstance(rot_euler, dict):
        mats = rot_euler
        rot_euler = (math.radians(90), 0, 0)
    elif isinstance(vane_count, dict):
        mats = vane_count
        vane_count = 8

    bezel_mat = bezel_mat or mats["chrome_jewel"]
    core_mat = core_mat or mats["leather_ebony"]

    # 1. Outer Knurled/Fluted Bezel Ring
    bezel = make_knurled_cylinder(f"{name}_Bezel", location, radius, depth * 0.7, rot_euler, bezel_mat, ridges=20, ridge_depth_ratio=0.06)

    # Coordinates along depth
    if rot_euler[0] != 0:
        duct_loc = (location[0], location[1] + depth * 0.15, location[2])
        trim_loc = (location[0], location[1] - depth * 0.15, location[2])
        amb_loc = (location[0], location[1] + depth * 0.10, location[2])
        knob_loc = (location[0], location[1] - depth * 0.35, location[2])
        emblem_loc = (location[0], location[1] - depth * 0.52, location[2])
        dot_loc = (location[0], location[1] - depth * 0.55, location[2])
    else:
        duct_loc = (location[0], location[1], location[2] - depth * 0.15)
        trim_loc = (location[0], location[1], location[2] + depth * 0.15)
        amb_loc = (location[0], location[1], location[2] - depth * 0.10)
        knob_loc = (location[0], location[1], location[2] + depth * 0.35)
        emblem_loc = (location[0], location[1], location[2] + depth * 0.52)
        dot_loc = (location[0], location[1], location[2] + depth * 0.55)

    # 2. Concentric Inner Airflow Duct Casing
    make_cylinder(f"{name}_Duct", duct_loc, radius * 0.88, depth * 0.85, rot_euler, core_mat, vertices=20)

    # 3. Inner Concentric Chrome Accent Ring
    make_torus(f"{name}_Trim_Ring", trim_loc, radius * 0.85, max(0.0012, radius * 0.04), rot_euler, mats["chrome_jewel"], major_segments=16, minor_segments=4)

    # 4. Ambient Back-Illuminated LED Halo Ring
    if illuminated:
        make_torus(f"{name}_Ambient_Ring", amb_loc, radius * 0.74, max(0.0012, radius * 0.035), rot_euler, mats["ambient_iceblue"], major_segments=16, minor_segments=4)

    # 5. Radial Aerodynamic Turbine Guide Vanes (angled blades)
    vane_len = radius * 0.52
    vane_thick = max(0.0016, radius * 0.06)
    vane_depth = depth * 0.40
    r_mid = radius * 0.55

    for v_i in range(vane_count):
        ang = v_i * (2.0 * math.pi / vane_count)
        if rot_euler[0] != 0:
            vx = location[0] + r_mid * math.cos(ang)
            vy = location[1] - depth * 0.05
            vz = location[2] + r_mid * math.sin(ang)
            make_box(f"{name}_Vane_{v_i+1}", (vx, vy, vz), (vane_thick, vane_depth, vane_len), mats["metal_brushed"], bevel=0)
        else:
            vx = location[0] + r_mid * math.cos(ang)
            vy = location[1] + r_mid * math.sin(ang)
            vz = location[2] + depth * 0.05
            make_box(f"{name}_Vane_{v_i+1}", (vx, vy, vz), (vane_thick, vane_len, vane_depth), mats["metal_brushed"], bevel=0)

    # 6. Central Directional Shutoff Knob / Hub Actuator
    make_knurled_cylinder(f"{name}_Center_Knob", knob_loc, radius * 0.28, depth * 0.35, rot_euler, bezel_mat, ridges=14)
    make_cylinder(f"{name}_Center_Emblem", emblem_loc, radius * 0.16, depth * 0.06, rot_euler, mats["wood_pianoblack"], vertices=12)
    if rot_euler[0] != 0:
        make_box(f"{name}_Center_Dot", dot_loc, (radius * 0.08, 0.001, radius * 0.08), mats["ambient_iceblue"], bevel=0)
    else:
        make_box(f"{name}_Center_Dot", dot_loc, (radius * 0.08, radius * 0.08, 0.001), mats["ambient_iceblue"], bevel=0)

    return bezel

def make_electronic_gear_shifter(name, location, size=(0.045, 0.075, 0.090), mats=None, crystal=False):
    if isinstance(size, dict):
        mats = size
        size = (0.045, 0.075, 0.090)
    sw, sd, sh = size

    # 1. Base Mounting Escutcheon & Chrome Trim Collar
    base = make_box(f"{name}_Base_Bezel", (location[0], location[1], location[2] + sh * 0.10), (sw * 1.30, sd * 1.25, sh * 0.20), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_Collar_Ring", (location[0], location[1], location[2] + sh * 0.20), (sw * 1.15, sd * 1.10, 0.006), mats["chrome_jewel"], bevel=0.001)

    # 2. Ergonomic Lever Body
    lever_mat = mats["crystal_faceted"] if crystal else mats["leather_ebony"]
    make_box(f"{name}_Lever_Body", (location[0], location[1], location[2] + sh * 0.60), (sw, sd, sh * 0.70), lever_mat, bevel=(0.012 if crystal else 0.008))

    if crystal:
        # Internal refracted illumination core
        make_box(f"{name}_Crystal_Core_Light", (location[0], location[1], location[2] + sh * 0.60), (sw * 0.45, sd * 0.45, sh * 0.45), mats["ambient_iceblue"], bevel=0.002)
        make_box(f"{name}_Crystal_Facet_Accent", (location[0], location[1] - sd * 0.15, location[2] + sh * 0.85), (sw * 0.75, 0.004, sh * 0.15), mats["chrome_jewel"], bevel=0.001)
    else:
        # Top & side electroplated chrome trim spear
        make_box(f"{name}_Grip_Chrome_Spear", (location[0], location[1], location[2] + sh * 0.92), (sw * 0.88, sd * 0.85, 0.008), mats["chrome_jewel"], bevel=0.002)

    # 3. Top Park [P] Push Button
    make_box(f"{name}_Park_Button", (location[0], location[1] - sd * 0.15, location[2] + sh * 0.95), (sw * 0.48, sd * 0.35, 0.008), mats["wood_pianoblack"], bevel=0.001)
    make_box(f"{name}_Park_P_Emboss", (location[0], location[1] - sd * 0.15, location[2] + sh * 0.99), (sw * 0.18, sd * 0.15, 0.002), mats["ambient_amber"], bevel=0)

    # 4. Ergonomic Trigger Release on Driver Side (-X)
    make_box(f"{name}_Trigger_Release", (location[0] - sw * 0.52, location[1] + sd * 0.15, location[2] + sh * 0.60), (0.006, sd * 0.35, sh * 0.30), mats["metal_brushed"], bevel=0.002)

    # 5. Backlit PRND Gear Display Strip
    disp_x = location[0] + sw * 0.82
    make_box(f"{name}_PRND_Strip", (disp_x, location[1], location[2] + sh * 0.18), (0.022, sd * 1.15, 0.006), mats["wood_pianoblack"], bevel=0.001)
    gears = [
        ("P", sd * 0.40, mats["ambient_amber"]),
        ("R", sd * 0.18, mats["anodized_red"]),
        ("N", -sd * 0.04, mats["metal_brushed"]),
        ("D", -sd * 0.26, mats["ambient_green"]),
        ("M", -sd * 0.46, mats["ambient_iceblue"]),
    ]
    for g_lbl, g_y, g_mat in gears:
        make_box(f"{name}_Gear_{g_lbl}", (disp_x, location[1] + g_y, location[2] + sh * 0.21), (0.010, 0.010, 0.002), g_mat, bevel=0)

    return base

def make_articulated_door_latch(name, location, size=(0.11, 0.035, 0.055), rot_euler=(0, 0, 0), mats=None, side="L", finish="chrome"):
    if isinstance(size, dict):
        mats = size
        size = (0.11, 0.035, 0.055)
    elif isinstance(rot_euler, dict):
        mats = rot_euler
        rot_euler = (0, 0, 0)

    lw, ld, lh = size
    sign = -1 if side == "L" else 1
    bezel_mat = mats["chrome_jewel"] if finish == "chrome" else mats["titanium_finish"]

    # 1. Contoured Escutcheon Bezel & Recessed Pocket
    escutcheon = make_box(f"{name}_Escutcheon", location, (lw, ld, lh), bezel_mat, bevel=0.004)
    make_box(f"{name}_Pocket", (location[0] + sign * 0.004, location[1], location[2]), (lw * 0.88, ld * 0.80, lh * 0.82), mats["leather_ebony"], bevel=0.002)

    # 2. Ambient Cove Lighting Strip along top edge of pocket
    make_box(f"{name}_Ambient_Cove", (location[0] + sign * 0.008, location[1], location[2] + lh * 0.38), (lw * 0.82, 0.003, 0.003), mats["ambient_iceblue"], bevel=0)

    # 3. Articulated Ergonomic Pull Handle Lever
    lever_x = location[0] + sign * 0.012
    make_box(f"{name}_Lever", (lever_x, location[1] - lw * 0.10, location[2]), (0.012, lw * 0.65, lh * 0.45), bezel_mat, bevel=0.003)
    make_cylinder(f"{name}_Finger_Lip", (lever_x + sign * 0.004, location[1] - lw * 0.32, location[2]), lh * 0.20, 0.012, (0, math.radians(90), 0), bezel_mat, vertices=16)
    make_cylinder(f"{name}_Pivot_Pin", (lever_x, location[1] + lw * 0.22, location[2]), 0.0035, lh * 0.70, (0, 0, 0), mats["titanium_finish"], vertices=10)

    # 4. Integrated Lock/Unlock Rocker Switch
    make_box(f"{name}_Lock_Rocker", (location[0] + sign * 0.008, location[1] + lw * 0.32, location[2]), (0.010, lw * 0.22, lh * 0.42), mats["wood_pianoblack"], bevel=0.001)
    make_box(f"{name}_Lock_Red_Bar", (location[0] + sign * 0.014, location[1] + lw * 0.32, location[2] + lh * 0.10), (0.002, lw * 0.12, 0.003), mats["anodized_red"], bevel=0)

    # 5. Seat Memory Button Bar (M, 1, 2)
    for m_i, m_lbl in enumerate(["M", "1", "2"]):
        make_cylinder(f"{name}_Mem_Btn_{m_lbl}", (location[0] + sign * 0.006, location[1] - lw * 0.42 - m_i * 0.022, location[2]), 0.0055, 0.004, (0, math.radians(90), 0), mats["metal_brushed"], vertices=12)

    return escutcheon

def make_steering_column_stalk_module(name, location, mats=None, stalk_length=0.13, has_gear_stalk=True):
    if isinstance(stalk_length, dict):
        mats = stalk_length
        stalk_length = 0.13

    stalk_angle = math.radians(70)

    # 1. Steering Column Collar Shroud Mounting Bracket & Trim Ring
    collar = make_cylinder(f"{name}_Shroud_Collar", location, 0.056, 0.045, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=24, bevel=0.003)
    make_torus(f"{name}_Trim_Ring", location, 0.058, 0.0025, (math.radians(90), 0, 0), mats["chrome_jewel"], major_segments=20, minor_segments=4)

    # 2. Left Multi-Function Stalk (Turn Signals / High Beam / Lane Departure)
    make_cylinder(f"{name}_Stalk_L_Stem", (location[0] - 0.10, location[1] + 0.02, location[2] + 0.035), 0.0065, stalk_length, (0, stalk_angle, 0), mats["metal_brushed"], vertices=14)
    make_knurled_cylinder(f"{name}_Stalk_L_Knurl_1", (location[0] - 0.135, location[1] + 0.025, location[2] + 0.048), 0.009, 0.020, (0, stalk_angle, 0), mats["chrome_jewel"], ridges=16)
    make_knurled_cylinder(f"{name}_Stalk_L_Knurl_2", (location[0] - 0.155, location[1] + 0.028, location[2] + 0.055), 0.0085, 0.016, (0, stalk_angle, 0), mats["chrome_jewel"], ridges=14)
    make_cylinder(f"{name}_Stalk_L_Tip_Btn", (location[0] - 0.172, location[1] + 0.030, location[2] + 0.062), 0.006, 0.008, (0, stalk_angle, 0), mats["wood_pianoblack"], vertices=12)
    make_box(f"{name}_Stalk_L_Icon", (location[0] - 0.175, location[1] + 0.030, location[2] + 0.063), (0.002, 0.003, 0.003), mats["ambient_green"], bevel=0)

    # 3. Right Multi-Function Stalk (Windshield Wipers & Rain Sensor)
    make_cylinder(f"{name}_Stalk_R_Stem", (location[0] + 0.10, location[1] + 0.02, location[2] + 0.035), 0.0065, stalk_length, (0, -stalk_angle, 0), mats["metal_brushed"], vertices=14)
    make_knurled_cylinder(f"{name}_Stalk_R_Knurl", (location[0] + 0.14, location[1] + 0.026, location[2] + 0.050), 0.009, 0.022, (0, -stalk_angle, 0), mats["chrome_jewel"], ridges=16)
    make_cylinder(f"{name}_Stalk_R_Tip_Btn", (location[0] + 0.165, location[1] + 0.030, location[2] + 0.060), 0.006, 0.008, (0, -stalk_angle, 0), mats["wood_pianoblack"], vertices=12)
    make_box(f"{name}_Stalk_R_Icon", (location[0] + 0.168, location[1] + 0.030, location[2] + 0.060), (0.002, 0.003, 0.003), mats["ambient_iceblue"], bevel=0)

    # 4. Lower Left Power Tilt/Telescoping 4-Way Joystick
    make_cylinder(f"{name}_Joystick_Stem", (location[0] - 0.08, location[1] + 0.015, location[2] - 0.035), 0.0045, 0.038, (0, math.radians(90), 0), mats["titanium_finish"], vertices=12)
    make_cylinder(f"{name}_Joystick_Knob", (location[0] - 0.105, location[1] + 0.015, location[2] - 0.035), 0.007, 0.012, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

    return collar

def make_cone(name, location, radius1, radius2, depth, rot_euler, mat=None, vertices=20):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_burmester_acoustic_tweeter_orb(name, location, rot_euler, mats, finish="chrome"):
    """
    Concours v10.0 Motorized Acoustic Tweeter Orb (Burmester High-End 3D Style).
    Features rotating machined housing, laser-cut spiral dispersion vanes, acoustic silk mesh backing,
    central solid metal phase plug cone, and 360-degree ambient LED illumination halo.
    """
    if finish == "rose_gold":
        metal_mat = mats.get("gold_rose", mats["chrome_jewel"])
    elif finish == "titanium":
        metal_mat = mats.get("titanium_finish", mats["metal_brushed"])
    elif finish == "gold":
        metal_mat = mats.get("anodized_gold", mats["chrome_jewel"])
    else:
        metal_mat = mats.get("chrome_jewel", mats["metal_brushed"])

    # 1. Base Mounting Collar & Stepped Motor Bezel
    base_ring = make_cylinder(f"{name}_BaseRing", location, 0.034, 0.012, rot_euler, metal_mat, vertices=28, bevel=0.002)
    make_cylinder(f"{name}_MotorSleeve", (location[0], location[1] + 0.006, location[2]), 0.030, 0.018, rot_euler, mats["wood_pianoblack"], vertices=24, bevel=0.001)

    # 2. Ambient LED Halo Ring (Edge glow behind perforated baffle)
    make_torus(f"{name}_AmbientHalo", (location[0], location[1] + 0.004, location[2]), 0.032, 0.0018, rot_euler, mats["ambient_iceblue"], major_segments=28, minor_segments=8)

    # 3. Acoustic Silk Mesh Backing Disc (prevents dust, controls acoustic backpressure)
    make_cylinder(f"{name}_SilkBacking", (location[0], location[1] + 0.012, location[2]), 0.026, 0.004, rot_euler, mats["acoustic_silk_mesh"], vertices=24)

    # 4. Concentric Spiral Dispersion Vanes
    make_torus(f"{name}_Spiral_Outer", (location[0], location[1] + 0.016, location[2]), 0.025, 0.0022, rot_euler, metal_mat, major_segments=24, minor_segments=10)
    make_torus(f"{name}_Spiral_Mid", (location[0], location[1] + 0.018, location[2]), 0.017, 0.0020, rot_euler, metal_mat, major_segments=20, minor_segments=8)
    make_torus(f"{name}_Spiral_Inner", (location[0], location[1] + 0.020, location[2]), 0.009, 0.0018, rot_euler, metal_mat, major_segments=16, minor_segments=8)

    # 5. Radial Acoustic Vane Crossbars (4 precision laser-etched ribs)
    for rib_idx, rib_angle in enumerate([0, 45, 90, 135]):
        rib_rot = (rot_euler[0], rot_euler[1], rot_euler[2] + math.radians(rib_angle))
        make_box(f"{name}_Rib_{rib_idx+1}", (location[0], location[1] + 0.018, location[2]), (0.050, 0.002, 0.002), metal_mat, bevel=0.0005)

    # 6. Central Machined Phase Plug Pointed Cone
    plug_rot = (rot_euler[0] + math.radians(90), rot_euler[1], rot_euler[2])
    make_cone(f"{name}_PhasePlug", (location[0], location[1] + 0.022, location[2]), 0.0048, 0.0006, 0.014, plug_rot, metal_mat, vertices=16)

    return base_ring

def make_frameless_electrochromic_mirror(name, location, rot_euler, mats):
    """
    Concours v10.0 Frameless Electrochromic Auto-Dimming Rearview Mirror.
    Includes ADAS windshield mounting foot with optical forward-sensing camera aperture,
    dual-axis stainless steel ball pivot knuckle, 1.8mm frameless beveled glass with electrochromic tint,
    satin micro-chamfer bezel, down-firing console ambient spotlight, and 3-button Homelink garage interface.
    """
    # 1. ADAS Windshield Header Mount Foot
    foot_pos = (location[0], location[1] + 0.055, location[2] + 0.038)
    foot = make_box(f"{name}_ADAS_Foot", foot_pos, (0.065, 0.028, 0.048), mats["wood_pianoblack"], bevel=0.004)
    # Forward-facing ADAS Optical Camera Lens
    make_cylinder(f"{name}_ADAS_CamLens", (foot_pos[0], foot_pos[1] + 0.015, foot_pos[2] + 0.004), 0.008, 0.006, (math.radians(90), 0, 0), mats["glass_clear"], vertices=18)
    make_cylinder(f"{name}_ADAS_CamBezel", (foot_pos[0], foot_pos[1] + 0.013, foot_pos[2] + 0.004), 0.0105, 0.004, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=18)

    # 2. Dual-Axis Articulated Ball Pivot Knuckle
    make_cylinder(f"{name}_PivotStem", (location[0], location[1] + 0.032, location[2] + 0.018), 0.0055, 0.044, (math.radians(-32), 0, 0), mats["metal_brushed"], vertices=14)
    make_cylinder(f"{name}_BallJoint", (location[0], location[1] + 0.015, location[2] + 0.006), 0.0095, 0.014, (0, 0, 0), mats["chrome_jewel"], vertices=16)

    # 3. Aerodynamic Mirror Rear Shell Casing
    make_box(f"{name}_RearShell", (location[0], location[1] + 0.008, location[2]), (0.245, 0.018, 0.065), mats["wood_pianoblack"], bevel=0.006)

    # 4. Perimeter Satin Aluminum Chamfer Edge
    make_box(f"{name}_SatinTrimEdge", (location[0], location[1] + 0.001, location[2]), (0.246, 0.003, 0.066), mats["chrome_satin"], bevel=0.001)

    # 5. 1.8mm Frameless Electrochromic Glass Mirror Plate
    make_box(f"{name}_GlassPlate", (location[0], location[1] - 0.002, location[2]), (0.242, 0.0035, 0.062), mats["mirror_electrochromic"], bevel=0.001)

    # 6. Down-Firing Ambient Console Spotlight (Amber night reading beam)
    make_cylinder(f"{name}_SpotlightLens", (location[0], location[1] + 0.003, location[2] - 0.033), 0.0045, 0.003, (0, 0, 0), mats["lens_map_lamp"], vertices=12)
    make_cylinder(f"{name}_SpotlightLED", (location[0], location[1] + 0.003, location[2] - 0.032), 0.0028, 0.002, (0, 0, 0), mats["ambient_amber"], vertices=10)

    # 7. 3-Button Integrated Homelink Remote Array
    for idx, btn_x in enumerate([-0.036, 0.0, 0.036]):
        make_box(f"{name}_HomelinkBtn_{idx+1}", (location[0] + btn_x, location[1] - 0.001, location[2] - 0.033), (0.016, 0.004, 0.004), mats["wood_pianoblack"], bevel=0.0008)
    make_cylinder(f"{name}_HomelinkLED", (location[0] + 0.058, location[1] - 0.001, location[2] - 0.033), 0.0018, 0.002, (0, 0, 0), mats["ambient_green"], vertices=8)

    return foot

def make_motorized_thigh_extension_bolster(name, location, width, depth, height, rot_euler, mats, leather_mat="leather_ebony"):
    """
    Concours v10.0 Motorized Articulated Thigh Extension Bolster.
    Features ergonomic contour padding, climate perforated leather insert, French contrast seam piping,
    exposed precision-ground stainless steel dual guide rails, and underside drive mechanism.
    """
    l_mat = mats.get(leather_mat, mats["leather_ebony"])

    # 1. Main Ergonomic Front Bolster Cushion Body
    cushion = make_box(f"{name}_CushionBody", location, (width, depth, height), l_mat, bevel=0.014, segments=3)

    # 2. Climate Perforated Breathable Center Insert
    insert_pos = (location[0], location[1], location[2] + height * 0.48)
    make_box(f"{name}_PerforatedInsert", insert_pos, (width * 0.82, depth * 0.78, height * 0.06), mats["leather_perforated"], bevel=0.004)

    # 3. French Seam Contrast Piping Lines (Left and Right)
    make_cylinder(f"{name}_Piping_L", (location[0] - width * 0.41, location[1], location[2] + height * 0.46), 0.0025, depth * 0.88, (math.radians(90), 0, 0), mats["stitch_contrast"], vertices=10)
    make_cylinder(f"{name}_Piping_R", (location[0] + width * 0.41, location[1], location[2] + height * 0.46), 0.0025, depth * 0.88, (math.radians(90), 0, 0), mats["stitch_contrast"], vertices=10)

    # 4. Precision-Ground Stainless Steel Sliding Guide Rails (2 parallel rods)
    rail_depth = depth * 1.15
    rail_z = location[2] - height * 0.20
    make_cylinder(f"{name}_GuideRail_L", (location[0] - width * 0.28, location[1] - depth * 0.50, rail_z), 0.007, rail_depth, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=16)
    make_cylinder(f"{name}_GuideRail_R", (location[0] + width * 0.28, location[1] - depth * 0.50, rail_z), 0.007, rail_depth, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=16)

    # 5. Linear Slide Bearing Bushings / Collars
    make_cylinder(f"{name}_Bushing_L", (location[0] - width * 0.28, location[1] - depth * 0.22, rail_z), 0.0095, 0.028, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=16)
    make_cylinder(f"{name}_Bushing_R", (location[0] + width * 0.28, location[1] - depth * 0.22, rail_z), 0.0095, 0.028, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=16)

    # 6. Underside Motorized Drive Actuator Housing & Manual Release Lever
    make_box(f"{name}_DriveMotor", (location[0], location[1] - depth * 0.28, location[2] - height * 0.26), (width * 0.32, depth * 0.40, height * 0.30), mats["wood_pianoblack"], bevel=0.003)
    make_cylinder(f"{name}_ManualLever", (location[0], location[1] + depth * 0.36, location[2] - height * 0.34), 0.0045, width * 0.22, (0, math.radians(90), 0), mats["metal_brushed"], vertices=12)

    return cushion

def make_illuminated_door_sill_kickplate(name, location, rot_euler, mats, script_text="EXECUTIVE", carbon=False, gold=False):
    """
    Concours v10.0 Illuminated Automotive Door Sill Scuff Plate / Kickplate.
    Features brushed billet aluminum or forged carbon scuff chassis, perimeter EPDM environmental rubber gasket,
    backlit laser-etched luminescent designation insignia, and 4x Grade 12.9 titanium torx fasteners.
    """
    if carbon:
        base_mat = mats["carbon_forged"]
        channel_mat = mats["wood_pianoblack"]
        glow_mat = mats["ambient_iceblue"]
    elif gold:
        base_mat = mats["anodized_gold"]
        channel_mat = mats["wood_pianoblack"]
        glow_mat = mats["ambient_amber"]
    else:
        base_mat = mats["billet_aluminum"]
        channel_mat = mats["metal_brushed"]
        glow_mat = mats["ambient_iceblue"]

    # 1. Perimeter EPDM Weather-Strip Rubber Gasket
    gasket = make_box(f"{name}_Gasket", location, (0.088, 0.670, 0.005), mats["rubber_traction"], bevel=0.001)

    # 2. Main Billet Aluminum / Forged Carbon Structural Scuff Plate
    make_box(f"{name}_MainPlate", (location[0], location[1], location[2] + 0.003), (0.080, 0.650, 0.006), base_mat, bevel=0.002)

    # 3. Recessed Center Accent Channel
    make_box(f"{name}_CenterChannel", (location[0], location[1], location[2] + 0.006), (0.052, 0.530, 0.002), channel_mat, bevel=0.001)

    # 4. Backlit Laser-Etched Luminescent Script Insignia
    make_box(f"{name}_IlluminatedScript", (location[0], location[1], location[2] + 0.0075), (0.024, 0.320, 0.0015), glow_mat, bevel=0)

    # 5. Dual Accent Luminescent Tick Marks (3 on each flank)
    for s_mult, s_y in [(-1, -0.21), (1, 0.21)]:
        for h_idx in range(3):
            make_box(f"{name}_AccentHash_{s_mult}_{h_idx}", (location[0], location[1] + s_y + h_idx * 0.018 * s_mult, location[2] + 0.0072), (0.016, 0.004, 0.0012), glow_mat, bevel=0)

    # 6. 4x Grade 12.9 Titanium Torx Corner Fasteners
    for fx in [-0.030, 0.030]:
        for fy in [-0.295, 0.295]:
            make_cylinder(f"{name}_Torx_{fx}_{fy}", (location[0] + fx, location[1] + fy, location[2] + 0.0065), 0.0035, 0.0025, (0, 0, 0), mats["titanium_finish"], vertices=12)
            make_cylinder(f"{name}_TorxPin_{fx}_{fy}", (location[0] + fx, location[1] + fy, location[2] + 0.0072), 0.0015, 0.0015, (0, 0, 0), mats["wood_pianoblack"], vertices=8)

    return gasket

def make_motorsport_window_safety_net(name, location, size, rot_euler, mats, webbing_mat="seatbelt_webbing"):
    """
    Concours v10.0 FIA Motorsport Competition Window Safety Net.
    Features aircraft-grade titanium top and bottom quick-release guide rods, anodized red spring-loaded
    quick-release buckle with latch pin, alloy cam tensioner with trailing strap, and cross-woven high-tensile nylon webbing ribbon lattice.
    """
    w_mat = mats.get(webbing_mat, mats["seatbelt_webbing"])
    width, length, height = size

    # 1. Top and Bottom Aircraft-Grade Titanium Mounting Rods
    top_rod = make_cylinder(f"{name}_TopRod", (location[0], location[1], location[2] + height * 0.50), 0.006, length * 1.05, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=14)
    make_cylinder(f"{name}_BtmRod", (location[0], location[1], location[2] - height * 0.50), 0.006, length * 1.05, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=14)

    # 2. Quick-Release Red Anodized Latch Buckle (Top Front)
    latch_pos = (location[0], location[1] + length * 0.52, location[2] + height * 0.50)
    make_box(f"{name}_LatchHousing", latch_pos, (0.024, 0.038, 0.024), mats["anodized_red"], bevel=0.002)
    make_box(f"{name}_ReleaseLever", (latch_pos[0], latch_pos[1] + 0.020, latch_pos[2] + 0.006), (0.016, 0.018, 0.008), mats["metal_brushed"], bevel=0.001)
    make_cylinder(f"{name}_LatchPin", latch_pos, 0.004, 0.028, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=10)

    # 3. Billet Alloy Cam Tensioner Buckle (Bottom Rear)
    cam_pos = (location[0], location[1] - length * 0.48, location[2] - height * 0.48)
    make_box(f"{name}_CamTensioner", cam_pos, (0.022, 0.034, 0.018), mats["billet_aluminum"], bevel=0.002)
    make_box(f"{name}_StrapTail", (cam_pos[0], cam_pos[1] - 0.018, cam_pos[2] - 0.065), (0.003, 0.028, 0.12), w_mat, bevel=0.0008)

    # 4. Horizontal Webbing Ribbons (4 rows)
    for h_idx in range(4):
        hz = location[2] - height * 0.36 + h_idx * (height * 0.72 / 3.0)
        make_box(f"{name}_Ribbon_H_{h_idx+1}", (location[0], location[1], hz), (0.0025, length * 0.96, 0.026), w_mat, bevel=0.0005)

    # 5. Vertical Webbing Ribbons (5 columns, staggered slightly along X for weave effect)
    for v_idx in range(5):
        vy = location[1] - length * 0.40 + v_idx * (length * 0.80 / 4.0)
        vx = location[0] + (0.0012 if v_idx % 2 == 0 else -0.0012)
        make_box(f"{name}_Ribbon_V_{v_idx+1}", (vx, vy, location[2]), (0.0025, 0.026, height * 0.96), w_mat, bevel=0.0005)

    # 6. Diagonal Structural Reinforcement Ribbon
    make_box(f"{name}_Ribbon_Diag", (location[0] + 0.002, location[1], location[2]), (0.0025, length * 0.98, 0.024), w_mat, bevel=0.0005)

    return top_rod

def make_aircraft_toggle_switch_bank(name, location, switch_count=4, rot_euler=(0, 0, 0), mats=None, carbon_plate=False):
    """
    Concours v11.0 Aircraft-Style Tactile Toggle Switch Bank (Ford GT / Pagani / Motorsport Cockpit).
    Features CNC billet aluminum or satin forged carbon chassis faceplate, arched safety wire-guard bail bars,
    anodized aluminum switch stems with teardrop actuation tips, knurled locking nuts, and color-coded status micro-LEDs.
    """
    plate_mat = mats["carbon_forged"] if carbon_plate else mats["billet_aluminum"]
    sw_spacing = 0.026
    total_w = switch_count * sw_spacing + 0.024
    plate_h = 0.046
    plate_d = 0.008

    # 1. Main Beveled Mounting Faceplate
    plate = make_box(f"{name}_FacePlate", location, (total_w, plate_d, plate_h), plate_mat, bevel=0.002)

    # 2. 4x Corner Grade 12.9 Titanium Mounting Bolts
    for bx in [-total_w * 0.44, total_w * 0.44]:
        for bz in [-plate_h * 0.38, plate_h * 0.38]:
            make_cylinder(f"{name}_Bolt_{bx}_{bz}", (location[0] + bx, location[1] - plate_d * 0.52, location[2] + bz), 0.0022, 0.002, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=10)

    # 3. Individual Toggle Switches
    led_colors = [mats["ambient_green"], mats["anodized_red"], mats["ambient_amber"], mats["ambient_iceblue"]]
    labels = ["IGN", "AERO", "PUMP", "PIT"]

    start_x = -((switch_count - 1) * sw_spacing) / 2.0
    for idx in range(switch_count):
        sx = location[0] + start_x + idx * sw_spacing

        # Dual Arched Safety Bail Bars (left & right wire loops preventing accidental hit)
        for guard_side, gx_offset in [("L", -0.009), ("R", 0.009)]:
            make_cylinder(f"{name}_Guard_{idx}_{guard_side}_PostTop", (sx + gx_offset, location[1] - plate_d * 0.50 - 0.012, location[2] + 0.014), 0.0016, 0.024, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=8)
            make_cylinder(f"{name}_Guard_{idx}_{guard_side}_PostBtm", (sx + gx_offset, location[1] - plate_d * 0.50 - 0.012, location[2] - 0.014), 0.0016, 0.024, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=8)
            make_cylinder(f"{name}_Guard_{idx}_{guard_side}_Bar", (sx + gx_offset, location[1] - plate_d * 0.50 - 0.024, location[2]), 0.0016, 0.028, (0, 0, 0), mats["metal_brushed"], vertices=8)

        # Knurled Retention Collar Nut
        make_cylinder(f"{name}_Collar_{idx}", (sx, location[1] - plate_d * 0.52, location[2]), 0.0055, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)

        # Pivoting Toggle Stem (angled upwards +20 deg)
        stem_rot = (math.radians(70), 0, 0)
        make_cylinder(f"{name}_Stem_{idx}", (sx, location[1] - plate_d * 0.50 - 0.010, location[2] + 0.004), 0.0028, 0.022, stem_rot, mats["billet_aluminum"], vertices=12)
        # Teardrop Actuator Tip
        make_cylinder(f"{name}_Tip_{idx}", (sx, location[1] - plate_d * 0.50 - 0.020, location[2] + 0.008), 0.0042, 0.006, stem_rot, mats["chrome_jewel"], vertices=12)

        # Micro-Status Indicator LED
        led_mat = led_colors[idx % len(led_colors)]
        make_cylinder(f"{name}_LED_{idx}", (sx, location[1] - plate_d * 0.52, location[2] + 0.016), 0.0022, 0.0025, (math.radians(90), 0, 0), led_mat, vertices=10)

        # Engraved Function Label Block
        lbl = labels[idx % len(labels)]
        make_box(f"{name}_Label_{idx}_{lbl}", (sx, location[1] - plate_d * 0.51, location[2] - 0.016), (0.014, 0.001, 0.005), mats["stitch_contrast"], bevel=0)

    return plate

def make_dead_pedal_footrest(name, location, size=(0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=None):
    """
    Concours v11.0 Heavy-Duty Ergonomic Dead Pedal Footrest.
    Features angled billet aluminum footrest chassis, CNC milled weight-reduction channels,
    embedded high-traction vulcanized rubber ribs, and Grade 12.9 titanium countersunk torx fasteners.
    """
    pw, pd, ph = size

    # 1. Angled Structural Footwell Anchor Wedge
    wedge = make_box(f"{name}_AnchorWedge", (location[0], location[1], location[2] - ph * 0.35), (pw * 0.95, pd * 0.95, ph * 0.65), mats["titanium_finish"], bevel=0.003)

    # 2. Main CNC Machined Billet Aluminum Footplate
    plate = make_box(f"{name}_BilletPlate", location, (pw, pd, 0.008), mats["billet_aluminum"], bevel=0.002)

    # 3. 4x Longitudinal Milled Speed Channels
    for ch_idx, ch_x in enumerate([-0.028, -0.010, 0.010, 0.028]):
        make_box(f"{name}_MilledChannel_{ch_idx+1}", (location[0] + ch_x, location[1], location[2] + 0.0035), (0.006, pd * 0.82, 0.002), mats["wood_pianoblack"], bevel=0.0005)

    # 4. 3x Raised Extruded Anti-Slip Rubber Traction Ribs
    for r_idx, r_x in enumerate([-0.019, 0.0, 0.019]):
        make_box(f"{name}_RubberRib_{r_idx+1}", (location[0] + r_x, location[1], location[2] + 0.0055), (0.007, pd * 0.78, 0.003), mats["rubber_traction"], bevel=0.0008)

    # 5. 4x Grade 12.9 Titanium Countersunk Fasteners
    for fx in [-pw * 0.38, pw * 0.38]:
        for fy in [-pd * 0.42, pd * 0.42]:
            make_cylinder(f"{name}_TorxBolt_{fx}_{fy}", (location[0] + fx, location[1] + fy, location[2] + 0.0042), 0.0035, 0.002, (0, 0, 0), mats["titanium_finish"], vertices=12)

    return plate

def make_thermoelectric_cup_holder(name, location, mats=None, finish="chrome"):
    """
    Concours v11.0 Dual Thermoelectric Heated / Cooled Beverage Well.
    Features dual-cavity brushed alloy or carbon top deck, dual deep aluminum cups,
    active Peltier cooling halo (ice-blue 3C) in Driver cup, active Peltier heating halo (amber-red 55C) in Passenger cup,
    spring-loaded rubber stabilization fingers, and concentric condensation drain grooves.
    """
    bezel_mat = mats["gold_rose"] if finish == "rose_gold" else (mats["anodized_gold"] if finish == "gold" else (mats["titanium_finish"] if finish == "titanium" else mats["chrome_jewel"]))

    # 1. Main Deck Bezel Plate
    deck = make_box(f"{name}_DeckPlate", (location[0], location[1], location[2] + 0.002), (0.115, 0.225, 0.006), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_TrimCollar", (location[0], location[1], location[2] + 0.004), (0.110, 0.220, 0.003), bezel_mat, bevel=0.002)

    # 2. Dual Beverage Wells (Front: Chilled Ice-Blue, Rear: Heated Amber-Red)
    wells_data = [
        ("Driver_Chilled", -0.054, mats["chilled_ice_blue"]),
        ("Passenger_Heated", 0.054, mats["heated_amber_red"]),
    ]

    for w_name, y_off, halo_mat in wells_data:
        wy = location[1] + y_off

        # Deep Cylindrical Insulated Cup Well
        make_cylinder(f"{name}_{w_name}_WellCavity", (location[0], wy, location[2] - 0.035), 0.040, 0.075, (0, 0, 0), mats["billet_aluminum"], vertices=24, bevel=0.002)

        # Electroplated Top Lip Ring
        make_torus(f"{name}_{w_name}_LipBezel", (location[0], wy, location[2] + 0.006), 0.041, 0.0022, (0, 0, 0), bezel_mat, major_segments=24, minor_segments=8)

        # Thermoelectric Temperature Mood Halo Ring (Emissive edge-glow)
        make_torus(f"{name}_{w_name}_PeltierHalo", (location[0], wy, location[2] + 0.003), 0.039, 0.0016, (0, 0, 0), halo_mat, major_segments=24, minor_segments=6)

        # 3x Spring-Loaded Rubber Centering Grip Fingers
        for finger_i in range(3):
            f_angle = finger_i * (2.0 * math.pi / 3.0)
            fx = location[0] + 0.035 * math.cos(f_angle)
            fy = wy + 0.035 * math.sin(f_angle)
            make_box(f"{name}_{w_name}_GripFinger_{finger_i+1}", (fx, fy, location[2] - 0.020), (0.006, 0.008, 0.030), mats["rubber_traction"], bevel=0.001)

        # Base Concentric Condensation Drain Disc
        make_cylinder(f"{name}_{w_name}_DrainBase", (location[0], wy, location[2] - 0.071), 0.036, 0.003, (0, 0, 0), mats["metal_brushed"], vertices=20)

    return deck

def make_tailored_floor_mat(name, location, size=(0.42, 0.65, 0.010), mats=None, leather_mat="leather_ebony", trim_leather=None, carbon_heel=False):
    """
    Concours v11.0 Tailored Deep-Pile Automotive Carpet Floor Mat.
    Features custom contoured velour body, contrast French leather perimeter binding border,
    stamped stainless steel or forged carbon driver heel scuff pad with anti-slip rubber ribs, and dual twist-lock floor grommets.
    """
    if trim_leather:
        leather_mat = trim_leather
    w, d, h = size
    l_mat = mats.get(leather_mat, mats["leather_ebony"])
    heel_mat = mats["carbon_forged"] if carbon_heel else mats["metal_brushed"]

    # 1. French Leather Perimeter Binding Frame
    frame = make_box(f"{name}_LeatherBinding", location, (w, d, h * 0.70), l_mat, bevel=0.004)

    # 2. Deep-Pile Velour Center Carpet Body
    make_box(f"{name}_VelourBody", (location[0], location[1], location[2] + 0.002), (w * 0.94, d * 0.94, h * 0.85), mats["carpet_velour"], bevel=0.003)

    # 3. Precision Driver Heel Scuff Plate
    heel_pos = (location[0], location[1] - d * 0.14, location[2] + 0.005)
    make_box(f"{name}_HeelScuffPad", heel_pos, (w * 0.62, d * 0.32, 0.003), heel_mat, bevel=0.0015)

    # 4x Anti-Slip Traction Grooves on Heel Plate
    for g_idx in range(4):
        gy = heel_pos[1] - 0.06 + g_idx * 0.040
        make_box(f"{name}_HeelGripRib_{g_idx+1}", (heel_pos[0], gy, heel_pos[2] + 0.0018), (w * 0.54, 0.005, 0.0015), mats["rubber_traction"], bevel=0)

    # 4. Dual Twist-Lock Floor Retention Grommets (Rear corners)
    for g_x in [-w * 0.32, w * 0.32]:
        gy = location[1] - d * 0.42
        make_cylinder(f"{name}_Grommet_{g_x}", (location[0] + g_x, gy, location[2] + 0.004), 0.012, 0.005, (0, 0, 0), mats["chrome_satin"], vertices=16, bevel=0.001)
        make_cylinder(f"{name}_Grommet_CenterPin_{g_x}", (location[0] + g_x, gy, location[2] + 0.006), 0.005, 0.004, (0, 0, 0), mats["wood_pianoblack"], vertices=12)

    return frame

def make_rollcage_impact_padding(name, location, length=0.35, radius=0.026, rot_euler=(0, 0, 0), mats=None):
    """
    Concours v11.0 FIA/SFI High-Impact Roll Cage Safety Padding.
    Features high-density energy-absorbing safety foam wrap around roll cage tubing,
    protective ballistic nylon outer sleeve with embossed Velcro closure seam, and circumferential retention bands.
    """
    # 1. High-Density SFI Safety Foam Wrap Cylinder
    foam = make_cylinder(f"{name}_SafetyFoam", location, radius, length, rot_euler, mats["foam_sfi_safety"], vertices=20, bevel=0.004)

    # 2. Outer Ballistic Nylon Sleeve with Longitudinal Velcro Seam
    seam_vec = Vector((radius * 0.98, 0, 0))
    seam_vec.rotate(Euler(rot_euler, 'XYZ'))
    seam_pos = (location[0] + seam_vec.x, location[1] + seam_vec.y, location[2] + seam_vec.z)
    make_cylinder(f"{name}_VelcroSeam", seam_pos, 0.004, length * 0.96, rot_euler, mats["seatbelt_webbing"], vertices=8)

    # 3. Circumferential Retention Bands (3 bands along length)
    for b_idx in [-0.38, 0.0, 0.38]:
        band_offset = Vector((0, b_idx * length, 0))
        band_offset.rotate(Euler(rot_euler, 'XYZ'))
        b_pos = (location[0] + band_offset.x, location[1] + band_offset.y, location[2] + band_offset.z)
        make_torus(f"{name}_RetentionBand_{b_idx}", b_pos, radius + 0.0012, 0.0020, rot_euler, mats["seatbelt_webbing"], major_segments=20, minor_segments=6)

    return foam

def make_b_pillar_assist_handle(name, location, length=0.18, rot_euler=(0, 0, 0), mats=None, leather_mat="leather_ebony", finish="chrome"):
    """
    Concours v11.0 Hand-Stitched Leather Roof/B-Pillar Passenger Assist Grab Handle.
    Features dual-tone hand-stitched leather strap, spring-loaded soft-return damping hinge blocks,
    brushed chrome escutcheon end caps, and integrated fold-out concealed coat hanger hook.
    """
    l_mat = mats.get(leather_mat, mats["leather_ebony"])
    bezel_mat = mats["anodized_gold"] if finish == "gold" else mats["chrome_jewel"]

    # 1. Ergonomic Contoured Leather Grab Strap
    strap = make_box(f"{name}_Strap", location, (0.024, length, 0.016), l_mat, bevel=0.006)

    # 2. Central French Seam Stitch Line
    make_cylinder(f"{name}_StitchLine", (location[0], location[1], location[2] + 0.007), 0.0016, length * 0.82, (math.radians(90), 0, 0), mats["stitch_contrast"], vertices=8)

    # 3. Left and Right Damping Hinge Mounting Blocks
    for end_name, y_mult in [("L", -1), ("R", 1)]:
        hy = location[1] + y_mult * (length * 0.48)
        make_box(f"{name}_Hinge_{end_name}", (location[0], hy, location[2] + 0.006), (0.028, 0.022, 0.020), mats["wood_pianoblack"], bevel=0.002)
        make_box(f"{name}_Escutcheon_{end_name}", (location[0], hy, location[2] + 0.015), (0.032, 0.026, 0.005), bezel_mat, bevel=0.0015)
        make_cylinder(f"{name}_PivotPin_{end_name}", (location[0], hy, location[2] + 0.006), 0.003, 0.026, (0, math.radians(90), 0), mats["titanium_finish"], vertices=10)

    # 4. Integrated Fold-Out Concealed Coat Hook (on rear hinge)
    hook_y = location[1] + length * 0.48
    make_box(f"{name}_CoatHook", (location[0], hook_y, location[2] - 0.008), (0.008, 0.012, 0.014), bezel_mat, bevel=0.001)

    return strap

# ==============================================================================
# v12.0 MASTER HOROLOGICAL & HYPER-FIDELITY BESPOKE CAD PRIMITIVES
# ==============================================================================

def make_exposed_horological_shifter_linkage(name, location, size=(0.14, 0.24, 0.14), mats=None, gold=False, gear=3):
    """
    Concours v12.0 Pagani / Spyker Exposed Horological Gated Shift Linkage.
    Features:
    - Billet skeletal cradle base with titanium pillow blocks.
    - Articulated titanium/gold shift shaft with reverse-lockout pull-collar and knurled trigger ring.
    - Spherical pivot gimbal bearing housing.
    - Longitudinal articulated selector linkage rod with dual miniature Heim spherical rod ends (brass balls & jam nuts).
    - Secondary selector bellcrank arm with pivot axle.
    - Dual counter-opposed centering coil springs visible under the skeletal gate plate.
    - Open gated shifter faceplate with polished shift channels and perimeter hex cap bolts.
    """
    frame_mat = mats["titanium_finish"]
    accent_mat = mats.get("titanium_anodized_gold", mats["anodized_gold"]) if gold else mats["titanium_finish"]
    brass_mat = mats.get("brass_watchmaker", mats["brass_brushed"])
    w, d, h = size

    # 1. Skeletal CNC Mounting Cradle Box
    cradle = make_box(f"{name}_Cradle", (location[0], location[1], location[2] + h * 0.25), (w, d, h * 0.5), mats["carbon_twill"], bevel=0.005)

    # 2. Open Gated Guide Faceplate with Perimeter Hex Cap Screws
    plate_z = location[2] + h * 0.50
    make_box(f"{name}_GatePlate", (location[0], location[1], plate_z), (w * 0.92, d * 0.88, 0.008), mats["metal_brushed"], bevel=0.002)
    for bx_mult in [-0.40, 0.40]:
        for by_mult in [-0.40, 0.0, 0.40]:
            make_hex_bolt(f"{name}_GateBolt_{bx_mult}_{by_mult}",
                          (location[0] + bx_mult * w, location[1] + by_mult * d, plate_z + 0.005),
                          0.003, 0.003, (0, 0, 0), mats["chrome_jewel"])

    # 3. Spherical Gimbal Pivot Bearing Housing (Center)
    pivot_center = (location[0], location[1], location[2] + h * 0.28)
    make_cylinder(f"{name}_Gimbal_Cup", pivot_center, 0.022, 0.028, (0, 0, 0), frame_mat, vertices=24, bevel=0.002)
    make_torus(f"{name}_Gimbal_Ring", (pivot_center[0], pivot_center[1], pivot_center[2] + 0.010), 0.023, 0.003, (0, 0, 0), brass_mat, major_segments=24, minor_segments=8)

    # 4. Vertical Titanium Shift Shaft with Reverse Lockout Collar
    shaft_h = h * 0.95
    shaft_top = location[2] + shaft_h
    make_cylinder(f"{name}_Shift_Shaft", (location[0], location[1], location[2] + shaft_h * 0.52), 0.0065, shaft_h, (0, 0, 0), accent_mat, vertices=20)
    collar_z = location[2] + shaft_h * 0.76
    make_cylinder(f"{name}_Lockout_Collar", (location[0], location[1], collar_z), 0.011, 0.020, (0, 0, 0), frame_mat, vertices=24, bevel=0.001)
    make_box(f"{name}_Lockout_Wing_L", (location[0] - 0.016, location[1], collar_z), (0.016, 0.008, 0.006), frame_mat, bevel=0.001)
    make_box(f"{name}_Lockout_Wing_R", (location[0] + 0.016, location[1], collar_z), (0.016, 0.008, 0.006), frame_mat, bevel=0.001)
    make_knurled_cylinder(f"{name}_Knob_Base", (location[0], location[1], shaft_top - 0.012), 0.014, 0.015, (0, 0, 0), accent_mat, ridges=20)
    make_cylinder(f"{name}_Knob_Top", (location[0], location[1], shaft_top), 0.018, 0.024, (0, 0, 0), mats["chrome_jewel"] if not gold else mats["anodized_gold"], vertices=24, bevel=0.006)

    # 5. Articulated Longitudinal Linkage Rod with Dual Heim Spherical Joints
    rod_y1 = location[1] - d * 0.35
    rod_y2 = location[1] + d * 0.35
    rod_z = location[2] + h * 0.16
    make_cylinder(f"{name}_Selector_TieRod", (location[0] + 0.032, location[1], rod_z), 0.004, d * 0.65, (math.radians(90), 0, 0), accent_mat, vertices=16)
    make_cylinder(f"{name}_Heim_Front_Body", (location[0] + 0.032, rod_y1, rod_z), 0.009, 0.014, (0, math.radians(90), 0), frame_mat, vertices=16, bevel=0.002)
    make_cylinder(f"{name}_Heim_Front_Ball", (location[0] + 0.032, rod_y1, rod_z), 0.006, 0.018, (0, math.radians(90), 0), brass_mat, vertices=16)
    make_hex_bolt(f"{name}_Heim_Front_JamNut", (location[0] + 0.032, rod_y1 + 0.012, rod_z), 0.0055, 0.004, (math.radians(90), 0, 0), frame_mat)
    make_cylinder(f"{name}_Heim_Rear_Body", (location[0] + 0.032, rod_y2, rod_z), 0.009, 0.014, (0, math.radians(90), 0), frame_mat, vertices=16, bevel=0.002)
    make_cylinder(f"{name}_Heim_Rear_Ball", (location[0] + 0.032, rod_y2, rod_z), 0.006, 0.018, (0, math.radians(90), 0), brass_mat, vertices=16)
    make_hex_bolt(f"{name}_Heim_Rear_JamNut", (location[0] + 0.032, rod_y2 - 0.012, rod_z), 0.0055, 0.004, (math.radians(90), 0, 0), frame_mat)

    # 6. Secondary Selector Bellcrank Arm with Needle Bearing Pivot
    make_box(f"{name}_Bellcrank_Arm", (location[0] + 0.018, rod_y2, rod_z + 0.018), (0.036, 0.012, 0.038), frame_mat, bevel=0.002)
    make_cylinder(f"{name}_Bellcrank_PivotAxle", (location[0], rod_y2, rod_z + 0.032), 0.006, 0.024, (0, math.radians(90), 0), accent_mat, vertices=16)

    # 7. Dual Counter-Opposed Centering Springs
    make_spring_coil(f"{name}_Centering_Spring_L", (location[0] - 0.025, location[1], location[2] + h * 0.22), radius=0.007, pitch=0.004, turns=5, wire_r=0.0012, rot_euler=(0, math.radians(90), 0), mat=mats["metal_brushed"])
    make_spring_coil(f"{name}_Centering_Spring_R", (location[0] + 0.025, location[1], location[2] + h * 0.22), radius=0.007, pitch=0.004, turns=5, wire_r=0.0012, rot_euler=(0, math.radians(-90), 0), mat=mats["metal_brushed"])

    return cradle

def make_racing_harness_system(name, seat_pos, mats=None, color="red"):
    """
    Concours v12.0 FIA 6-Point Competition Racing Harness System.
    Features:
    - Twin shoulder belts draped over seat backrest pass-through escutcheons.
    - CNC machined aluminum quick-adjuster ladder buckles with contrasting pull tabs.
    - Stitched FIA/SFI safety certification patch.
    - Central rotary turn-release Camlock buckle in anodized red/titanium with laser arrow.
    - Dual lap belts emerging from hip cutouts with forged alloy snap-hook carabiners.
    - Anti-submarine crotch strap.
    """
    webbing_mat = mats.get("harness_nylon_red", mats["harness_red"]) if color == "red" else mats["seatbelt_webbing"]
    camlock_mat = mats.get("harness_camlock_red", mats["anodized_red"])
    tag_mat = mats.get("safety_tag_yellow", mats["ambient_amber"])
    metal_mat = mats["billet_aluminum"]

    sx, sy, sz = seat_pos
    buckle_pos = (sx, sy + 0.12, sz + 0.32)

    buckle = make_cylinder(f"{name}_Camlock_Body", buckle_pos, 0.028, 0.016, (math.radians(20), 0, 0), mats["titanium_finish"], vertices=24, bevel=0.002)
    make_knurled_cylinder(f"{name}_Camlock_TurnRing", (buckle_pos[0], buckle_pos[1] - 0.004, buckle_pos[2] + 0.002), 0.026, 0.008, (math.radians(20), 0, 0), camlock_mat, ridges=18)
    make_cylinder(f"{name}_Camlock_CenterBtn", (buckle_pos[0], buckle_pos[1] - 0.008, buckle_pos[2] + 0.004), 0.012, 0.004, (math.radians(20), 0, 0), mats["chrome_jewel"], vertices=16)

    for side_name, sign in [("L", -1), ("R", 1)]:
        top_anchor = (sx + sign * 0.11, sy - 0.08, sz + 0.72)
        mid_point = (sx + sign * 0.08, sy + 0.02, sz + 0.52)
        lower_point = (sx + sign * 0.035, sy + 0.09, sz + 0.36)

        make_box(f"{name}_Shoulder_Upper_{side_name}",
                 ((top_anchor[0] + mid_point[0]) * 0.5, (top_anchor[1] + mid_point[1]) * 0.5, (top_anchor[2] + mid_point[2]) * 0.5),
                 (0.052, 0.12, 0.006), webbing_mat, bevel=0.001)

        make_box(f"{name}_Adjuster_Buckle_{side_name}", mid_point, (0.058, 0.028, 0.010), metal_mat, bevel=0.002)
        make_box(f"{name}_Adjuster_PullTab_{side_name}", (mid_point[0], mid_point[1] + 0.016, mid_point[2] - 0.015), (0.040, 0.018, 0.005), mats["anodized_red"], bevel=0.001)

        make_box(f"{name}_Shoulder_Lower_{side_name}",
                 ((mid_point[0] + lower_point[0]) * 0.5, (mid_point[1] + lower_point[1]) * 0.5, (mid_point[2] + lower_point[2]) * 0.5),
                 (0.050, 0.10, 0.006), webbing_mat, bevel=0.001)

        make_box(f"{name}_LatchTongue_Shoulder_{side_name}", (lower_point[0], lower_point[1] + 0.012, lower_point[2] - 0.015), (0.032, 0.016, 0.004), mats["chrome_jewel"], bevel=0.001)

    make_box(f"{name}_FIA_Safety_Tag", (sx - 0.08, sy + 0.05, sz + 0.58), (0.042, 0.032, 0.004), tag_mat, bevel=0.0005)
    make_box(f"{name}_FIA_Safety_Hologram", (sx - 0.08, sy + 0.05, sz + 0.585), (0.022, 0.016, 0.002), mats["ambient_iceblue"], bevel=0.0002)

    for side_name, sign in [("L", -1), ("R", 1)]:
        hip_anchor = (sx + sign * 0.26, sy - 0.02, sz + 0.18)
        lap_mid = (sx + sign * 0.14, sy + 0.08, sz + 0.24)

        make_box(f"{name}_LapBelt_{side_name}",
                 ((hip_anchor[0] + lap_mid[0]) * 0.5, (hip_anchor[1] + lap_mid[1]) * 0.5, (hip_anchor[2] + lap_mid[2]) * 0.5),
                 (0.14, 0.052, 0.006), webbing_mat, bevel=0.001)

        make_cylinder(f"{name}_Carabiner_Hook_{side_name}", hip_anchor, 0.014, 0.016, (0, math.radians(90), 0), mats["titanium_finish"], vertices=16, bevel=0.002)
        make_torus(f"{name}_Carabiner_Eyelet_{side_name}", (hip_anchor[0] + sign * 0.010, hip_anchor[1], hip_anchor[2]), 0.012, 0.003, (0, math.radians(90), 0), mats["metal_brushed"], major_segments=16, minor_segments=6)

    make_box(f"{name}_Crotch_Strap", (sx, sy + 0.12, sz + 0.22), (0.046, 0.08, 0.006), webbing_mat, bevel=0.001)
    return buckle

def make_fire_suppression_system(name, location, size=(0.11, 0.32, 0.11), rot_euler=(0, 0, 0), mats=None):
    """
    Concours v12.0 FIA LifeLine Cockpit Fire Suppression System.
    Features:
    - High-gloss crimson pressurized cylinder with spun dome endcaps.
    - Twin CNC billet saddle mounting clamps with over-center stainless toggle latches.
    - Solid brass valve distribution head with integrated analog pressure dial.
    - Braided stainless steel discharge line with blue/red AN fittings.
    - Emergency T-handle manual pull-cable with safety locking cotter pin.
    """
    bottle_mat = mats.get("fire_bottle_gloss_red", mats["anodized_red"])
    brass_mat = mats.get("brass_watchmaker", mats["brass_brushed"])
    w, length, h = size
    radius = w * 0.48

    bottle = make_cylinder(f"{name}_Bottle", location, radius, length * 0.78, rot_euler, bottle_mat, vertices=24, bevel=0.006)
    btm_offset = Vector((0, -length * 0.39, 0))
    btm_offset.rotate(Euler(rot_euler, 'XYZ'))
    make_cylinder(f"{name}_Dome_Bottom", (location[0] + btm_offset.x, location[1] + btm_offset.y, location[2] + btm_offset.z),
                  radius * 0.95, 0.025, rot_euler, bottle_mat, vertices=24, bevel=0.010)

    for c_y in [-0.22 * length, 0.22 * length]:
        c_offset = Vector((0, c_y, 0))
        c_offset.rotate(Euler(rot_euler, 'XYZ'))
        c_pos = (location[0] + c_offset.x, location[1] + c_offset.y, location[2] + c_offset.z)
        make_torus(f"{name}_SaddleClamp_{c_y}", c_pos, radius + 0.004, 0.004, rot_euler, mats["billet_aluminum"], major_segments=24, minor_segments=6)
        foot_offset = Vector((0, c_y, -radius - 0.008))
        foot_offset.rotate(Euler(rot_euler, 'XYZ'))
        make_box(f"{name}_ClampFoot_{c_y}", (location[0] + foot_offset.x, location[1] + foot_offset.y, location[2] + foot_offset.z),
                 (w * 1.15, 0.028, 0.012), mats["titanium_finish"], bevel=0.002)

    top_offset = Vector((0, length * 0.42, 0))
    top_offset.rotate(Euler(rot_euler, 'XYZ'))
    top_pos = (location[0] + top_offset.x, location[1] + top_offset.y, location[2] + top_offset.z)
    make_cylinder(f"{name}_Manifold_Collar", top_pos, radius * 0.45, 0.026, rot_euler, brass_mat, vertices=16, bevel=0.002)
    make_box(f"{name}_Manifold_Block", (top_pos[0], top_pos[1], top_pos[2] + 0.018), (0.038, 0.038, 0.032), brass_mat, bevel=0.003)

    gauge_pos = (top_pos[0] + 0.024, top_pos[1], top_pos[2] + 0.022)
    make_cylinder(f"{name}_Pressure_Gauge_Bezel", gauge_pos, 0.012, 0.008, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=20, bevel=0.001)
    make_cylinder(f"{name}_Pressure_Gauge_Face", (gauge_pos[0] + 0.003, gauge_pos[1], gauge_pos[2]), 0.010, 0.003, (0, math.radians(90), 0), mats["ambient_green"], vertices=16)

    an_pos = (top_pos[0] - 0.022, top_pos[1], top_pos[2] + 0.022)
    make_an_fitting(f"{name}_Discharge_AN", an_pos, 0.007, 0.022, (0, math.radians(-90), 0), mats["an_fitting_blue"], mats["anodized_red"], mats["braided_steel"])

    t_pos = (top_pos[0], top_pos[1] + 0.025, top_pos[2] + 0.032)
    make_cylinder(f"{name}_PullCable_Stem", t_pos, 0.003, 0.022, rot_euler, mats["titanium_finish"], vertices=10)
    make_box(f"{name}_PullHandle_T", (t_pos[0], t_pos[1] + 0.012, t_pos[2]), (0.036, 0.010, 0.014), mats["anodized_red"], bevel=0.002)

    return bottle

def make_steering_thumb_encoders_and_magnetic_paddles(name, center_pos, yoke_w=0.34, yoke_h=0.22, rot_euler=(0, 0, 0), mats=None, stripe_color="yellow"):
    """
    Concours v12.0 Motorsport Steering Thumb Encoders & Rear Magnetic Paddle Shifters.
    Features:
    - 9:00 and 3:00 thumb-operated knurled alloy rotary encoders with detents and index markers.
    - Rear magnetic paddle shifter assemblies with twin neodymium magnets and microswitch trigger housings.
    - Top dead center (12 o'clock) contrast alignment stripe.
    """
    alloy_mat = mats["billet_aluminum"]
    stripe_mat = mats.get("stripe_yellow", mats["ambient_amber"]) if stripe_color == "yellow" else mats["anodized_red"]
    cx, cy, cz = center_pos

    top_z = cz + yoke_h * 0.52
    make_torus(f"{name}_12_OClock_Stripe", (cx, cy, top_z), 0.017, 0.004, (0, math.radians(90), 0), stripe_mat, major_segments=16, minor_segments=6)

    for side_name, sign in [("L", -1), ("R", 1)]:
        thumb_x = cx + sign * (yoke_w * 0.36)
        thumb_y = cy - 0.012
        thumb_z = cz + 0.010

        make_box(f"{name}_Thumb_Pocket_{side_name}", (thumb_x, thumb_y, thumb_z), (0.028, 0.022, 0.026), mats["titanium_finish"], bevel=0.002)
        make_knurled_cylinder(f"{name}_Thumb_Wheel_{side_name}", (thumb_x, thumb_y - 0.004, thumb_z), 0.011, 0.014, (math.radians(90), 0, 0), alloy_mat, ridges=18)
        make_box(f"{name}_Thumb_Index_{side_name}", (thumb_x, thumb_y - 0.012, thumb_z + 0.010), (0.003, 0.004, 0.004), mats["ambient_iceblue"], bevel=0.0005)

    for side_name, sign, symbol in [("L", -1, "-"), ("R", 1, "+")]:
        paddle_x = cx + sign * (yoke_w * 0.42)
        paddle_y = cy + 0.038
        paddle_z = cz + 0.015

        make_box(f"{name}_Paddle_Bracket_{side_name}", (paddle_x, paddle_y, paddle_z), (0.024, 0.028, 0.034), mats["titanium_finish"], bevel=0.002)
        make_cylinder(f"{name}_Magnet_Fixed_{side_name}", (paddle_x, paddle_y + 0.006, paddle_z + 0.008), 0.006, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=16)
        make_cylinder(f"{name}_Magnet_Moving_{side_name}", (paddle_x, paddle_y + 0.014, paddle_z + 0.008), 0.006, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=16)
        make_box(f"{name}_Paddle_Blade_{side_name}", (paddle_x + sign * 0.012, paddle_y + 0.020, paddle_z), (0.018, 0.006, 0.085), mats["carbon_twill"], bevel=0.002)
        make_box(f"{name}_Paddle_Symbol_{side_name}", (paddle_x + sign * 0.012, paddle_y + 0.016, paddle_z + 0.020), (0.008, 0.003, 0.008), mats["anodized_red"] if sign < 0 else mats["ambient_green"], bevel=0.0005)

def make_vip_airline_tray_table_and_bar(name, location, mats=None, wood_finish="walnut", extended=False):
    """
    Concours v12.0 Ultra-Luxury VIP Rear Airline Fold-Out Tray Table & Crystal Bar Cabinet.
    Features:
    - Articulated fold-out executive tray table in bookmatched walnut or forged carbon with chrome peripheral rim.
    - Satin titanium multi-link support hinge arms with damping cylinders.
    - Recessed illuminated bar niche with twin optical crystal champagne flutes and mood light halo.
    """
    wood_mat = mats.get("wood_walnut", mats["leather_cognac"]) if wood_finish == "walnut" else mats["carbon_forged"]
    crystal_mat = mats.get("champagne_crystal", mats["glass_clear"])
    lx, ly, lz = location

    cabinet = make_box(f"{name}_BarCabinet", (lx, ly, lz), (0.46, 0.18, 0.32), mats["wood_pianoblack"], bevel=0.008)

    for f_idx, fx in enumerate([-0.11, 0.11]):
        flute_pos = (lx + fx, ly + 0.02, lz - 0.02)
        make_cylinder(f"{name}_Flute_Base_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2]), 0.022, 0.005, (0, 0, 0), crystal_mat, vertices=20, bevel=0.001)
        make_cylinder(f"{name}_Flute_Stem_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.038), 0.004, 0.070, (0, 0, 0), crystal_mat, vertices=12)
        make_cylinder(f"{name}_Flute_Bowl_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.105), 0.020, 0.075, (0, 0, 0), crystal_mat, vertices=20, bevel=0.005)
        make_cylinder(f"{name}_Champagne_Liquid_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.090), 0.018, 0.040, (0, 0, 0), mats.get("brass_watchmaker", mats["anodized_gold"]), vertices=16)

    make_torus(f"{name}_Ambient_Halo", (lx, ly + 0.04, lz + 0.06), 0.18, 0.003, (0, 0, 0), mats["ambient_iceblue"], major_segments=32, minor_segments=6)

    table_y = ly - 0.11
    table_z = lz + 0.10
    table = make_box(f"{name}_TrayTable_Surface", (lx, table_y, table_z), (0.42, 0.28, 0.016), wood_mat, bevel=0.004)
    make_box(f"{name}_TrayTable_ChromeRim", (lx, table_y, table_z), (0.43, 0.29, 0.018), mats["chrome_jewel"], bevel=0.002)

    for h_idx, hx in enumerate([-0.16, 0.16]):
        make_cylinder(f"{name}_Hinge_Arm_{h_idx+1}", (lx + hx, ly - 0.04, lz + 0.04), 0.006, 0.12, (math.radians(45), 0, 0), mats["titanium_finish"], vertices=12)
        make_cylinder(f"{name}_Hinge_Pivot_{h_idx+1}", (lx + hx, ly - 0.08, lz + 0.08), 0.008, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

    return cabinet

def make_high_end_acoustic_speaker_array(name, location, radius=0.075, depth=0.025, rot_euler=(0, 0, 0), mats=None, finish="chrome"):
    """
    Concours v12.0 Burmester / Naim High-End Acoustic 3D Speaker Array.
    Features:
    - Stepped outer brushed alloy escutcheon with beveled perimeter.
    - Concentric laser-slotted acoustic radiation rings (3 radial tiers).
    - Fine acoustic silk-mesh core backing.
    - Central jewel-turned phase plug with diamond-cut highlight ring.
    """
    bezel_mat = mats["anodized_gold"] if finish == "gold" else mats["metal_brushed"]
    jewel_mat = mats["chrome_jewel"] if finish == "chrome" else mats["anodized_gold"]

    outer_ring = make_cylinder(f"{name}_OuterBezel", location, radius, depth * 0.6, rot_euler, bezel_mat, vertices=32, bevel=0.003)

    core_offset = Vector((0, 0, depth * 0.2))
    core_offset.rotate(Euler(rot_euler, 'XYZ'))
    core_pos = (location[0] + core_offset.x, location[1] + core_offset.y, location[2] + core_offset.z)
    make_cylinder(f"{name}_AcousticMesh", core_pos, radius * 0.88, depth * 0.3, rot_euler, mats["acoustic_silk_mesh"], vertices=24)

    for r_idx, r_ratio in enumerate([0.38, 0.60, 0.78]):
        ring_offset = Vector((0, 0, depth * 0.35))
        ring_offset.rotate(Euler(rot_euler, 'XYZ'))
        r_pos = (location[0] + ring_offset.x, location[1] + ring_offset.y, location[2] + ring_offset.z)
        make_torus(f"{name}_AcousticRing_{r_idx+1}", r_pos, radius * r_ratio, 0.0022, rot_euler, bezel_mat, major_segments=32, minor_segments=6)

    plug_offset = Vector((0, 0, depth * 0.45))
    plug_offset.rotate(Euler(rot_euler, 'XYZ'))
    plug_pos = (location[0] + plug_offset.x, location[1] + plug_offset.y, location[2] + plug_offset.z)
    make_cylinder(f"{name}_PhasePlug_Base", plug_pos, radius * 0.18, depth * 0.4, rot_euler, jewel_mat, vertices=24, bevel=0.002)
    make_torus(f"{name}_PhasePlug_Highlight", plug_pos, radius * 0.19, 0.0018, rot_euler, mats["chrome_jewel"], major_segments=24, minor_segments=6)

    return outer_ring

def make_headrest_crest_medallion(name, location, rot_euler=(0, 0, 0), mats=None, finish="gold"):
    """
    Concours v12.0 Jewel Headrest Crest Medallion.
    """
    rim_mat = mats["anodized_gold"] if finish == "gold" else mats["chrome_jewel"]
    make_cylinder(f"{name}_Rim", location, 0.018, 0.004, rot_euler, rim_mat, vertices=24, bevel=0.001)
    make_cylinder(f"{name}_Core", location, 0.015, 0.005, rot_euler, mats["wood_pianoblack"], vertices=24)
    make_box(f"{name}_Inlay", location, (0.012, 0.004, 0.012), rim_mat, bevel=0.0005)

def make_seat_adjustment_switchpack(name, location, rot_euler=(0, 0, 0), mats=None, finish="chrome"):
    """
    Concours v12.0 Classic Mercedes/Rolls-Royce Style Seat Silhouette Switchpack.
    """
    alloy_mat = mats["chrome_jewel"] if finish == "chrome" else mats["metal_brushed"]
    lx, ly, lz = location
    make_box(f"{name}_Plate", (lx, ly, lz), (0.012, 0.085, 0.045), mats["titanium_finish"], bevel=0.002)
    make_box(f"{name}_CushionSwitch", (lx + 0.006, ly - 0.015, lz - 0.008), (0.008, 0.038, 0.010), alloy_mat, bevel=0.001)
    make_box(f"{name}_BackSwitch", (lx + 0.006, ly - 0.028, lz + 0.010), (0.008, 0.012, 0.026), alloy_mat, bevel=0.001)
    make_cylinder(f"{name}_HeadrestBtn", (lx + 0.006, ly - 0.028, lz + 0.028), 0.005, 0.008, (0, math.radians(90), 0), alloy_mat, vertices=12)

def make_pedal_pushrod_linkage(name, location, mats=None):
    """
    Concours v12.0 Master Cylinder Pushrod Linkage with Rubber Dust Bellows.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_Pushrod", (lx, ly + 0.04, lz), 0.005, 0.08, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=16)
    make_torus(f"{name}_Bellows_1", (lx, ly + 0.02, lz), 0.011, 0.0035, (math.radians(90), 0, 0), mats["rubber_traction"])
    make_torus(f"{name}_Bellows_2", (lx, ly + 0.035, lz), 0.011, 0.0035, (math.radians(90), 0, 0), mats["rubber_traction"])
    make_box(f"{name}_Clevis", (lx, ly, lz), (0.016, 0.016, 0.016), mats["billet_aluminum"], bevel=0.002)

def make_fragrance_atomizer_flacon(name, location, mats=None):
    """
    Concours v12.0 Cabin Air Fragrance Ionizer / Atomizer Flacon.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_Flacon_Vessel", (lx, ly, lz), 0.022, 0.055, (0, 0, 0), mats.get("champagne_crystal", mats["glass_clear"]), vertices=24, bevel=0.002)
    make_cylinder(f"{name}_Perfume_Fluid", (lx, ly, lz - 0.005), 0.019, 0.038, (0, 0, 0), mats.get("brass_watchmaker", mats["anodized_gold"]), vertices=20)
    make_knurled_cylinder(f"{name}_Atomizer_Cap", (lx, ly, lz + 0.032), 0.024, 0.012, (0, 0, 0), mats["chrome_jewel"], ridges=20)
    make_torus(f"{name}_Mood_Halo", (lx, ly, lz + 0.015), 0.023, 0.002, (0, 0, 0), mats["ambient_iceblue"])

# ==============================================================================
# v13.0 ULTIMATE HAUTE HORLOGERIE & AEROSPACE BESPOKE CAD PRIMITIVES
# ==============================================================================

def make_hydraulic_handbrake_assembly(name, location, rot_euler=(0, 0, 0), mats=None, finish="anodized_red"):
    """
    Concours v13.0 Competition Vertical Fly-Off Hydraulic Handbrake.
    Features CNC billet aluminum slotted upright lever with lightening slots, knurled cylinder grip,
    reverse lock trigger, Wilwood-style remote master cylinder, and braided AN-3 feed line.
    """
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

def make_augmented_reality_hud_collimator(name, location, rot_euler=(0, 0, 0), mats=None):
    """
    Concours v13.0 Holographic AR-HUD Optical Collimator Well.
    Features stepped anti-reflective baffles, angled dielectric combiner plate, and etched trajectory reticle.
    """
    lx, ly, lz = location
    make_box(f"{name}_ApertureWell", (lx, ly, lz), (0.18, 0.11, 0.035), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_Baffle_1", (lx, ly, lz - 0.006), (0.16, 0.095, 0.025), mats["carbon_matte_dry"], bevel=0.002)
    make_box(f"{name}_Baffle_2", (lx, ly, lz - 0.012), (0.14, 0.080, 0.020), mats["carbon_matte_dry"], bevel=0.002)
    make_box(f"{name}_CombinerGlass", (lx, ly, lz + 0.004), (0.16, 0.088, 0.004), mats["glass_clear"], bevel=0.001)
    make_box(f"{name}_HUD_Reticle", (lx, ly, lz + 0.006), (0.09, 0.045, 0.001), mats["hud_projection_cyan"], bevel=0)

def make_tourbillon_multi_axis_escapement(name, location, rot_euler=(0, 0, 0), mats=None):
    """
    Concours v13.0 Haute Horlogerie 3-Axis Flying Tourbillon Complication Module.
    Features skeletonized titanium cage bridges, rotating balance wheel, synthetic ruby endstones in gold chatons,
    blued steel fixing screws, and sapphire crystal protective dome.
    """
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

def make_haptic_rotary_command_dial(name, location, mats=None):
    """
    Concours v13.0 Ergonomic Center Console Haptic Command Controller.
    Features knurled jog wheel, concave black glass touch surface, 8 backlit capacitive shortcut keys, and Nappa leather palm rest.
    """
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

def make_3d_knitted_perforated_seat_accent(name, location, size=(0.32, 0.38, 0.015), mats=None, accent_mat="anodized_petrol_blue"):
    """
    Concours v13.0 Ventilated Seat Cushion Center Insert Panel with Contrasting Secondary Sub-layer.
    """
    lx, ly, lz = location
    w, d, h = size
    u_mat = mats.get(accent_mat, mats["anodized_petrol_blue"])
    make_box(f"{name}_AccentUnderlayer", (lx, ly, lz - 0.004), (w * 0.96, d * 0.96, 0.004), u_mat, bevel=0.001)
    make_box(f"{name}_PerforatedFace", (lx, ly, lz), (w, d, 0.006), mats["leather_ebony"], bevel=0.003)
    for r_idx in range(5):
        ry = ly - d * 0.35 + r_idx * (d * 0.175)
        make_box(f"{name}_ContourRib_{r_idx+1}", (lx, ry, lz + 0.004), (w * 0.88, 0.014, 0.005), mats["leather_ebony"], bevel=0.002)

def make_steering_column_telescopic_shroud(name, location, mats=None):
    """
    Concours v13.0 Motorized Steering Column Shroud with Pleated Accordion Boot and Stalk Collars.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_ColumnHousing", (lx, ly, lz), 0.042, 0.12, (math.radians(-22), 0, 0), mats["wood_pianoblack"], vertices=24, bevel=0.002)
    for b_idx in [-0.03, 0.0, 0.03]:
        make_torus(f"{name}_Bellows_{b_idx}", (lx, ly + b_idx * 0.8, lz + b_idx * 0.3), 0.043, 0.005, (math.radians(-22), 0, 0), mats["leather_ebony"], major_segments=24, minor_segments=8)
    for side, sx in [("L", -0.052), ("R", 0.052)]:
        make_cylinder(f"{name}_StalkCollar_{side}", (lx + sx, ly + 0.01, lz), 0.012, 0.018, (0, math.radians(90), 0), mats["metal_brushed"], vertices=16)
        make_torus(f"{name}_StalkDetent_{side}", (lx + sx, ly + 0.01, lz), 0.013, 0.002, (0, math.radians(90), 0), mats["ambient_iceblue"], major_segments=16, minor_segments=6)

def make_b_pillar_seatbelt_height_adjuster(name, location, rot_euler=(0, 0, 0), mats=None):
    """
    Concours v13.0 B-Pillar Structural Seatbelt Upper Anchorage Slider with Swiveling Chrome D-Ring.
    """
    lx, ly, lz = location
    make_box(f"{name}_TrackPlate", (lx, ly, lz), (0.022, 0.032, 0.11), mats["wood_pianoblack"], bevel=0.002)
    for d_idx in range(5):
        dz = lz - 0.04 + d_idx * 0.020
        make_box(f"{name}_Detent_{d_idx+1}", (lx + 0.008, ly, dz), (0.004, 0.018, 0.005), mats["metal_brushed"], bevel=0.0005)
    make_box(f"{name}_SliderBlock", (lx + 0.012, ly, lz), (0.024, 0.028, 0.032), mats["metal_brushed"], bevel=0.002)
    make_box(f"{name}_ReleaseBtn", (lx + 0.022, ly, lz), (0.006, 0.018, 0.014), mats["chrome_jewel"], bevel=0.001)
    make_torus(f"{name}_DRing", (lx + 0.026, ly, lz - 0.018), 0.016, 0.003, (0, math.radians(90), 0), mats["chrome_jewel"], major_segments=20, minor_segments=8)

def make_door_pocket_waterfall_ambient_guide(name, location, length=0.34, rot_euler=(0, 0, 0), mats=None):
    """
    Concours v13.0 Door Card Lower Storage Bin with Concealed Indirect Waterfall Ambient LED Lightguide.
    """
    lx, ly, lz = location
    make_box(f"{name}_PocketLip", (lx, ly, lz), (0.045, length, 0.065), mats["leather_ebony"], bevel=0.005)
    make_cylinder(f"{name}_LightGuide", (lx - 0.018, ly, lz + 0.026), 0.0025, length * 0.90, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=12)
    make_box(f"{name}_RubberMat", (lx, ly, lz - 0.028), (0.038, length * 0.92, 0.004), mats["rubber_traction"], bevel=0.001)

def make_footwell_night_navigation_gooseneck(name, location, mats=None):
    """
    Concours v13.0 Flexible Stainless Steel Co-Driver Night Navigation Map Light with Red Filter Lens.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_BaseMount", (lx, ly, lz), 0.016, 0.006, (0, 0, 0), mats["billet_aluminum"], vertices=16)
    for g_idx in range(4):
        gz = lz + 0.01 + g_idx * 0.018
        gx = lx + g_idx * 0.006
        make_cylinder(f"{name}_GooseSegment_{g_idx+1}", (gx, ly, gz), 0.004, 0.018, (0, math.radians(12), 0), mats["braided_steel"], vertices=12)
    head_pos = (lx + 0.024, ly, lz + 0.085)
    make_cone(f"{name}_LampHead", head_pos, 0.012, 0.006, 0.024, (0, math.radians(60), 0), mats["billet_aluminum"], vertices=16)
    make_cylinder(f"{name}_RedLens", (head_pos[0] + 0.010, head_pos[1], head_pos[2] - 0.006), 0.008, 0.002, (0, math.radians(60), 0), mats["anodized_red"], vertices=12)

def make_rear_vip_refrigerated_bar_cabinet(name, location, mats=None):
    """
    Concours v13.0 Rear VIP Cabin Champagne Chilling Vault with Vacuum Insulated Glass Door and Ice-Blue Glow.
    """
    lx, ly, lz = location
    make_box(f"{name}_Cabinet", (lx, ly, lz), (0.18, 0.22, 0.24), mats["wood_walnut"], bevel=0.005)
    make_box(f"{name}_GlassDoor", (lx, ly + 0.11, lz), (0.17, 0.008, 0.23), mats["glass_clear"], bevel=0.001)
    make_box(f"{name}_DoorTrim", (lx, ly + 0.112, lz), (0.174, 0.004, 0.234), mats["chrome_jewel"], bevel=0.001)
    make_box(f"{name}_Chamber", (lx, ly, lz), (0.15, 0.18, 0.20), mats["metal_brushed"], bevel=0.002)
    for b_x in [-0.045, 0.045]:
        make_cylinder(f"{name}_BottleCradle_{b_x}", (lx + b_x, ly - 0.02, lz - 0.05), 0.038, 0.14, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=20)
    make_box(f"{name}_TempDisplay", (lx, ly + 0.114, lz + 0.09), (0.040, 0.002, 0.016), mats["wood_pianoblack"], bevel=0.0005)
    make_box(f"{name}_TempLED", (lx, ly + 0.115, lz + 0.09), (0.032, 0.001, 0.010), mats["ambient_iceblue"], bevel=0)

# ==============================================================================
# v14.0 ULTIMATE BESPOKE HYPER-LUXURY & MOTORSPORT CAD PRIMITIVES
# ==============================================================================

def make_smart_glass_roof_segments_and_grab_handles(name, location, mats=None):
    """
    Concours v14.0 Electrochromic PDLC Smart Glass Roof Panels with Silver Busbars and 4 Damped Grab Handles.
    """
    lx, ly, lz = location
    for row_i, ry in enumerate([ly - 0.28, ly + 0.28]):
        for col_j, rx in enumerate([lx - 0.24, lx + 0.24]):
            make_box(f"{name}_PDLC_Panel_{row_i}_{col_j}", (rx, ry, lz), (0.42, 0.48, 0.008), mats["pdlc_smart_glass"], bevel=0.002)
            make_box(f"{name}_Busbar_Border_{row_i}_{col_j}", (rx, ry, lz + 0.003), (0.43, 0.49, 0.003), mats["metal_brushed"], bevel=0.001)
    for h_side, hx in [("L", lx - 0.58), ("R", lx + 0.58)]:
        for h_pos, hy in [("Front", ly + 0.35), ("Rear", ly - 0.35)]:
            hname = f"{name}_Grab_{h_side}_{h_pos}"
            make_cylinder(f"{hname}_Pivot1", (hx, hy - 0.08, lz - 0.01), 0.006, 0.022, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
            make_cylinder(f"{hname}_Pivot2", (hx, hy + 0.08, lz - 0.01), 0.006, 0.022, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
            make_box(f"{hname}_HandleBar", (hx, hy, lz - 0.025), (0.024, 0.16, 0.016), mats["leather_ebony"], bevel=0.004)
            make_box(f"{hname}_CoatHook", (hx - 0.008 * (1 if h_side == "L" else -1), hy + 0.06, lz - 0.032), (0.006, 0.012, 0.012), mats["chrome_jewel"], bevel=0.001)
            make_cylinder(f"{hname}_Spotlight", (hx, hy, lz - 0.012), 0.008, 0.004, (0, 0, 0), mats["optical_lens_coated"], vertices=16)

def make_passenger_cinema_screen_and_virtual_mirror_monitors(name, location, mats=None):
    """
    Concours v14.0 Passenger 10.9-inch Dedicated OLED Display and A-Pillar Digital Side Mirror OLED Pods.
    """
    lx, ly, lz = location
    make_box(f"{name}_Cinema_Housing", (lx + 0.38, ly - 0.05, lz), (0.36, 0.014, 0.16), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_Cinema_OLED", (lx + 0.38, ly - 0.056, lz), (0.34, 0.004, 0.145), mats["screen_oled"], bevel=0.001)
    make_box(f"{name}_Cinema_Glow", (lx + 0.38, ly - 0.058, lz - 0.076), (0.32, 0.002, 0.003), mats["ambient_iceblue"], bevel=0)
    for m_side, mx, rot_deg in [("L", lx - 0.62, 35), ("R", lx + 0.62, -35)]:
        mname = f"{name}_VirtualMirror_{m_side}"
        make_box(f"{mname}_Pod", (mx, ly + 0.04, lz + 0.08), (0.085, 0.045, 0.11), mats["carbon_matte_dry"], bevel=0.004)
        make_box(f"{mname}_Screen", (mx, ly + 0.022, lz + 0.08), (0.075, 0.006, 0.098), mats["screen_oled"], bevel=0.001)
        make_cone(f"{mname}_RadarAlert", (mx, ly + 0.018, lz + 0.11), 0.006, 0.001, 0.004, (math.radians(rot_deg), 0, 0), mats["ambient_amber"], vertices=12)

def make_pneumatic_lumbar_air_harness(name, location, mats=None):
    """
    Concours v14.0 Multi-Chamber Pneumatic Massage Bladder Manifold and Motorized Thigh Lead Screw.
    """
    lx, ly, lz = location
    make_box(f"{name}_ManifoldBlock", (lx, ly + 0.12, lz), (0.12, 0.035, 0.04), mats["chilled_aluminum"], bevel=0.002)
    for v_i in range(4):
        make_cylinder(f"{name}_Solenoid_{v_i+1}", (lx - 0.045 + v_i * 0.03, ly + 0.14, lz), 0.008, 0.018, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    for t_i, tz in enumerate([lz + 0.08, lz + 0.16, lz + 0.24]):
        make_torus(f"{name}_PneumaticHose_{t_i+1}", (lx, ly + 0.10, tz), 0.08, 0.004, (0, math.radians(90), 0), mats["rubber_traction"], major_segments=24, minor_segments=12)
        make_box(f"{name}_BladderChamber_{t_i+1}", (lx, ly + 0.06, tz), (0.16, 0.02, 0.06), mats["leather_ebony"], bevel=0.006)
    make_cylinder(f"{name}_ThighStepperMotor", (lx - 0.06, ly - 0.14, lz - 0.08), 0.018, 0.06, (0, math.radians(90), 0), mats["titanium_finish"], vertices=20)
    make_cylinder(f"{name}_ThighLeadScrew", (lx + 0.03, ly - 0.14, lz - 0.08), 0.006, 0.12, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

def make_pit_radio_comms_and_ptt_assembly(name, location, mats=None):
    """
    Concours v14.0 Billet Digital Motorsport Pit Radio Box with Coiled PTT Cable and LEMO/Fischer Sockets.
    """
    lx, ly, lz = location
    make_box(f"{name}_RadioChassis", (lx, ly, lz), (0.14, 0.10, 0.065), mats["chilled_aluminum"], bevel=0.003)
    for fin_i in range(6):
        make_box(f"{name}_CoolingFin_{fin_i+1}", (lx - 0.05 + fin_i * 0.02, ly, lz + 0.034), (0.003, 0.09, 0.012), mats["metal_brushed"], bevel=0)
    make_cylinder(f"{name}_AntennaBNC", (lx - 0.045, ly + 0.04, lz + 0.04), 0.007, 0.024, (0, 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder(f"{name}_FischerSocket1", (lx + 0.02, ly - 0.052, lz), 0.009, 0.012, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    make_cylinder(f"{name}_FischerSocket2", (lx + 0.05, ly - 0.052, lz), 0.009, 0.012, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    for coil_k in range(5):
        make_torus(f"{name}_PTT_Coil_{coil_k+1}", (lx + 0.05, ly - 0.08 - coil_k * 0.015, lz), 0.012, 0.003, (0, math.radians(90), 0), mats["coiled_wire_polyurethane"], major_segments=16, minor_segments=8)
    make_cylinder(f"{name}_PTT_PlugHead", (lx + 0.05, ly - 0.18, lz), 0.008, 0.026, (math.radians(90), 0, 0), mats["porcelain_ceramic_white"], vertices=16)
    make_cylinder(f"{name}_PTT_NeonRing", (lx + 0.05, ly - 0.194, lz), 0.0085, 0.003, (math.radians(90), 0, 0), mats["neon_yellow_accent"], vertices=16)

def make_inductive_phone_charging_station(name, location, mats=None):
    """
    Concours v14.0 Qi2 / MagSafe Wireless Phone Charging Tray with Active Micro-Cooling Vents.
    """
    lx, ly, lz = location
    make_box(f"{name}_TrayRecess", (lx, ly, lz), (0.13, 0.19, 0.018), mats["wood_pianoblack"], bevel=0.002)
    make_box(f"{name}_RubberPad", (lx, ly, lz + 0.006), (0.12, 0.18, 0.004), mats["rubber_traction"], bevel=0.001)
    for c_i in range(3):
        make_box(f"{name}_Chevron_{c_i+1}", (lx, ly - 0.04 + c_i * 0.04, lz + 0.009), (0.045, 0.004, 0.002), mats["leather_ebony"], bevel=0)
    make_box(f"{name}_LED_Halo", (lx, ly, lz + 0.008), (0.124, 0.184, 0.002), mats["ambient_iceblue"], bevel=0.001)
    for slot_j in range(4):
        make_box(f"{name}_VentSlot_{slot_j+1}", (lx - 0.03 + slot_j * 0.02, ly - 0.085, lz + 0.008), (0.010, 0.003, 0.002), mats["metal_brushed"], bevel=0)
    make_box(f"{name}_PhoneBody", (lx, ly, lz + 0.014), (0.075, 0.155, 0.008), mats["titanium_finish"], bevel=0.002)
    make_box(f"{name}_PhoneGlass", (lx, ly, lz + 0.018), (0.072, 0.152, 0.001), mats["wood_pianoblack"], bevel=0.001)
    make_cylinder(f"{name}_PhoneCameraLens", (lx - 0.022, ly + 0.055, lz + 0.019), 0.007, 0.002, (0, 0, 0), mats["optical_lens_coated"], vertices=16)

def make_motorsport_heel_rest_plate_and_footrest(name, location, mats=None):
    """
    Concours v14.0 Dimpled Aircraft Aluminum Floor Heel Rest Plate and Co-Driver Footbrace Wedge.
    """
    lx, ly, lz = location
    make_box(f"{name}_HeelPlate", (lx, ly, lz), (0.36, 0.18, 0.008), mats["chilled_aluminum"], bevel=0.002)
    for hx_i in [-0.12, -0.06, 0.0, 0.06, 0.12]:
        for hy_j in [-0.05, 0.0, 0.05]:
            make_cylinder(f"{name}_DimpleHole_{hx_i}_{hy_j}", (lx + hx_i, ly + hy_j, lz + 0.004), 0.009, 0.003, (0, 0, 0), mats["carbon_matte_dry"], vertices=16)
    make_box(f"{name}_FootbraceWedge", (lx + 0.22, ly + 0.02, lz + 0.04), (0.08, 0.16, 0.07), mats["carbon_matte_dry"], bevel=0.003)
    make_box(f"{name}_GripTapeStrip1", (lx + 0.22, ly - 0.02, lz + 0.076), (0.06, 0.025, 0.002), mats["rubber_traction"], bevel=0)
    make_box(f"{name}_GripTapeStrip2", (lx + 0.22, ly + 0.04, lz + 0.076), (0.06, 0.025, 0.002), mats["rubber_traction"], bevel=0)

def make_door_concealed_umbrella_system(name, location, mats=None):
    """
    Concours v14.0 Rolls-Royce Style Concealed Door Umbrella Socket and Heated Ejector Pommel.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_TubeSocket", (lx, ly, lz), 0.024, 0.32, (0, math.radians(90), 0), mats["chilled_aluminum"], vertices=24)
    make_cylinder(f"{name}_BezelRim", (lx + 0.16, ly, lz), 0.028, 0.006, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=24)
    make_cylinder(f"{name}_UmbrellaHandle", (lx + 0.175, ly, lz), 0.016, 0.036, (0, math.radians(90), 0), mats["brushed_rose_gold"], vertices=20)
    make_cylinder(f"{name}_HandleKnurling", (lx + 0.185, ly, lz), 0.017, 0.018, (0, math.radians(90), 0), mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_DrainHeaterRing", (lx + 0.158, ly, lz), 0.025, 0.002, (0, math.radians(90), 0), mats["ambient_amber"], vertices=20)

def make_steering_column_quick_release_spline_hub(name, location, mats=None):
    """
    Concours v14.0 FIA Splined Quick-Release Steering Wheel Adapter Hub with Knurled Pull Sleeve.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_BaseBoss", (lx, ly, lz), 0.044, 0.022, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=28)
    for b_idx in range(6):
        ang = b_idx * (2 * math.pi / 6)
        bx = lx + 0.034 * math.cos(ang)
        bz = lz + 0.034 * math.sin(ang)
        make_cylinder(f"{name}_TitaniumBolt_{b_idx+1}", (bx, ly + 0.012, bz), 0.0035, 0.006, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)
    make_cylinder(f"{name}_SplinedShaft", (lx, ly + 0.016, lz), 0.024, 0.026, (math.radians(90), 0, 0), mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_ReleaseCollar", (lx, ly + 0.026, lz), 0.042, 0.016, (math.radians(90), 0, 0), mats["anodized_red"], vertices=28)
    for det_i in range(3):
        dang = det_i * (2 * math.pi / 3)
        dx = lx + 0.032 * math.cos(dang)
        dz = lz + 0.032 * math.sin(dang)
        make_cylinder(f"{name}_DetentPin_{det_i+1}", (dx, ly + 0.028, dz), 0.004, 0.008, (math.radians(90), 0, 0), mats["neon_yellow_accent"], vertices=12)
    make_cylinder(f"{name}_GoldContactsHub", (lx, ly + 0.032, lz), 0.014, 0.003, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=16)

def make_ottoman_calf_rest_and_footrest_assembly(name, location, mats=None):
    """
    Concours v14.0 VIP First-Class Motorized Calf Rest Ottoman Cushion and Flip-Out Stainless Footrest.
    """
    lx, ly, lz = location
    make_box(f"{name}_CalfCushion", (lx, ly, lz), (0.36, 0.22, 0.09), mats["leather_ebony"], bevel=0.012)
    make_box(f"{name}_PipingBorder", (lx, ly, lz + 0.045), (0.37, 0.23, 0.004), mats["brushed_rose_gold"], bevel=0.001)
    for a_side, ax in [("L", lx - 0.16), ("R", lx + 0.16)]:
        make_box(f"{name}_ScissorArm1_{a_side}", (ax, ly - 0.08, lz - 0.06), (0.014, 0.14, 0.010), mats["chrome_jewel"], bevel=0.002)
        make_box(f"{name}_ScissorArm2_{a_side}", (ax, ly - 0.14, lz - 0.09), (0.014, 0.12, 0.010), mats["chrome_jewel"], bevel=0.002)
    make_box(f"{name}_FootrestStepPlate", (lx, ly - 0.22, lz - 0.12), (0.32, 0.16, 0.012), mats["chilled_aluminum"], bevel=0.003)
    for r_i in range(4):
        make_box(f"{name}_RubberTractionRib_{r_i+1}", (lx, ly - 0.26 + r_i * 0.026, lz - 0.113), (0.28, 0.008, 0.003), mats["rubber_traction"], bevel=0)

def make_a_pillar_ribbon_tweeter_pod(name, location, rot_euler, mats=None):
    """
    Concours v14.0 High-End Acoustic Deflector Lens with Spiral Fibonacci Vanes and Diamond Dome Center.
    """
    lx, ly, lz = location
    make_cylinder(f"{name}_LensHousing", (lx, ly, lz), 0.036, 0.022, rot_euler, mats["chilled_aluminum"], vertices=28)
    make_cylinder(f"{name}_ChromeBezel", (lx, ly, lz + 0.011), 0.038, 0.004, rot_euler, mats["chrome_jewel"], vertices=28)
    make_torus(f"{name}_AmbientRing", (lx, ly, lz + 0.012), 0.034, 0.002, rot_euler, mats["ambient_iceblue"], major_segments=24, minor_segments=12)
    make_cone(f"{name}_NautilusSpiralCone", (lx, ly, lz + 0.014), 0.026, 0.004, 0.014, rot_euler, mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_DiamondDomeCenter", (lx, ly, lz + 0.022), 0.008, 0.003, rot_euler, mats["optical_lens_coated"], vertices=16)

def apply_weighted_normals_and_weld(dist=0.0003):
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            mesh = obj.data
            bm = bmesh.new()
            bm.from_mesh(mesh)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            for f in bm.faces:
                f.smooth = True
            bm.to_mesh(mesh)
            bm.free()
            mesh.update()

            wn = obj.modifiers.get("WeightedNormal")
            if not wn:
                wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 100

def export_active_scene_to_glb(filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    apply_weighted_normals_and_weld()
    bpy.ops.object.select_all(action='SELECT')

    # Atomic replace with retry to prevent Windows file-watcher collisions
    temp_filepath = os.path.join(os.path.dirname(filepath), f".tmp_{os.path.basename(filepath)}")
    for attempt in range(5):
        try:
            if os.path.exists(temp_filepath):
                try:
                    os.remove(temp_filepath)
                except Exception:
                    pass

            bpy.ops.export_scene.gltf(
                filepath=temp_filepath,
                use_selection=False,
                export_format='GLB',
                export_apply=True,
                export_yup=True
            )

            # Move temp file to target
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception:
                    time.sleep(0.1)
                    try:
                        os.remove(filepath)
                    except Exception:
                        pass

            shutil.move(temp_filepath, filepath)
            break
        except Exception as e:
            print(f"[WARN] Export attempt {attempt+1}/5 for {os.path.basename(filepath)} had issue: {e}")
            time.sleep(0.25)
    else:
        # Fallback to direct export
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            use_selection=False,
            export_format='GLB',
            export_apply=True,
            export_yup=True
        )

    print(f"[EXPORT] Successfully wrote: {filepath} ({os.path.getsize(filepath)/1024:.1f} KB)")

# ==============================================================================
# 1. DETAILED DASHBOARDS BUILDER
# ==============================================================================
def build_executive_dashboard(output_path):
    print(f"\n[BUILD] Engineering Executive Dashboard (v5.0) -> {output_path}")
    mats = reset_scene_and_get_mats()

    dash_w = 1.48
    dash_d = 0.58
    
    # 1. Upper Padded Leather Dash Top with Instrument Hood Ridge
    make_box("Dash_Upper_Leather_Cowl", (0.0, 0.0, 0.76), (dash_w, dash_d, 0.09), mats["leather_ebony"], bevel=0.015)
    make_box("Dash_Instrument_Hood_Binnacle", (-0.36, 0.08, 0.83), (0.46, 0.32, 0.07), mats["leather_ebony"], bevel=0.012)
    
    # French Contrast Seam Lines along the hood ridge
    make_box("Dash_Contrast_Seam_L", (-0.36, 0.22, 0.865), (0.44, 0.006, 0.004), mats["stitch_contrast"], bevel=0)
    make_box("Dash_Contrast_Seam_R", (-0.36, -0.06, 0.865), (0.44, 0.006, 0.004), mats["stitch_contrast"], bevel=0)
    make_box("Dash_Contrast_Seam_Pass", (0.28, 0.12, 0.805), (0.64, 0.006, 0.004), mats["stitch_contrast"], bevel=0)

    # 2. Open-Pore Walnut Wood Decorative Veneer Spear (Full width accent)
    make_box("Dash_Veneer_Accent_Spear", (0.0, -0.06, 0.72), (dash_w * 0.96, 0.04, 0.08), mats["wood_walnut"], bevel=0.006)
    make_box("Dash_Veneer_Chrome_Trim_Lower", (0.0, -0.075, 0.675), (dash_w * 0.96, 0.015, 0.006), mats["chrome_jewel"], bevel=0.002)

    # 3. Ambient LED Light Pipe (Edge-lit cyan/ice-blue contour line)
    make_box("Dash_Ambient_Lightguide_Strip", (0.0, -0.08, 0.68), (dash_w * 0.95, 0.008, 0.006), mats["ambient_iceblue"], bevel=0)

    # 4. Precision Turbine HVAC Air Vents with Knurled Bezels, Concentric Ducts, 8 Radial Vanes & Directional Knobs
    vent_x_coords = [-0.56, -0.16, 0.16, 0.56]
    for v_idx, vx in enumerate(vent_x_coords):
        make_precision_turbine_ac_vent(f"Dash_Turbine_HVAC_{v_idx+1}", (vx, -0.065, 0.73), 0.038, 0.024, (math.radians(90), 0, 0), mats, vane_count=8, illuminated=True)
        make_knurled_cylinder(f"Dash_HVAC_Thumbwheel_{v_idx+1}", (vx + 0.055, -0.065, 0.73), 0.007, 0.016, (0, math.radians(90), 0), mats["metal_brushed"], ridges=16)

    # Windshield Base Defroster Micro-Louvers
    make_box("Dash_Defroster_Slot_L", (-0.36, 0.22, 0.81), (0.42, 0.03, 0.012), mats["wood_pianoblack"], bevel=0.002)
    make_box("Dash_Defroster_Slot_R", (0.36, 0.22, 0.81), (0.42, 0.03, 0.012), mats["wood_pianoblack"], bevel=0.002)

    # A-Pillar Motorized Rotating Burmester Acoustic Tweeter Orbs
    make_burmester_acoustic_tweeter_orb("Dash_Burmester_Tweeter_L", (-dash_w * 0.46, 0.05, 0.78), (0, math.radians(45), 0), mats, finish="chrome")
    make_burmester_acoustic_tweeter_orb("Dash_Burmester_Tweeter_R", (dash_w * 0.46, 0.05, 0.78), (0, math.radians(-45), 0), mats, finish="chrome")

    # Frameless Electrochromic Rearview Mirror with ADAS Optical Unit
    make_frameless_electrochromic_mirror("Dash_Electrochromic_Mirror", (0.0, 0.05, 0.98), (0, 0, 0), mats)

    # 5. Ultra-Wide Digital Curved OLED Hyperscreen Displays & UI Graphics
    make_box("Dash_Digital_Instrument_Display", (-0.36, -0.02, 0.78), (0.42, 0.015, 0.16), mats["screen_oled"], bevel=0.002)
    make_box("Dash_Cluster_Speedo_Arc", (-0.46, -0.022, 0.78), (0.08, 0.002, 0.08), mats["screen_ui_gauge"], bevel=0)
    make_box("Dash_Cluster_Tach_Arc", (-0.26, -0.022, 0.78), (0.08, 0.002, 0.08), mats["screen_ui_gauge"], bevel=0)
    make_box("Dash_Center_Infotainment_Touchscreen", (0.06, -0.05, 0.75), (0.46, 0.018, 0.22), mats["screen_oled"], bevel=0.002)
    make_box("Dash_Center_Touchscreen_Glass_Bezel", (0.06, -0.045, 0.75), (0.475, 0.012, 0.235), mats["wood_pianoblack"], bevel=0.003)

    # Passenger 10.9-inch Dedicated Interactive Entertainment OLED Screen
    make_box("Dash_Passenger_OLED_Screen", (0.42, -0.048, 0.74), (0.32, 0.012, 0.14), mats["screen_passenger"], bevel=0.002)
    make_box("Dash_Passenger_Screen_Bezel", (0.42, -0.044, 0.74), (0.335, 0.008, 0.155), mats["wood_pianoblack"], bevel=0.002)

    # 6. Ultra-Fidelity Swiss Multi-Register Chronograph Timepiece with Knurled Crown & Sub-Dials
    make_swiss_chronograph("Dash_Swiss_Chronograph", (0.06, 0.06, 0.81), 0.038, 0.024, (math.radians(35), 0, 0), mats, ridges=36)

    # 6b. Continuous Windshield Defroster Acoustic Micro-Grille (24 precision slots)
    for slit_i in range(24):
        sx = -0.66 + slit_i * 0.058
        make_box(f"Dash_Windshield_Defroster_Slit_{slit_i+1}", (sx, 0.24, 0.81), (0.042, 0.008, 0.006), mats["wood_pianoblack"], bevel=0)

    # 6c. Passenger Airbag Laser-Scored Invisible Parting Seam
    make_box("Dash_Passenger_Airbag_Seam_H", (0.42, 0.10, 0.806), (0.34, 0.003, 0.003), mats["wood_pianoblack"], bevel=0)
    make_box("Dash_Passenger_Airbag_Seam_V1", (0.25, 0.04, 0.795), (0.003, 0.12, 0.003), mats["wood_pianoblack"], bevel=0)
    make_box("Dash_Passenger_Airbag_Seam_V2", (0.59, 0.04, 0.795), (0.003, 0.12, 0.003), mats["wood_pianoblack"], bevel=0)

    # 7. Advanced Recessed Head-Up Display (HUD) Projector with Holographic Symbology
    make_hud_glass_projector("Dash_HUD_Projector", (-0.36, 0.18, 0.80), (0.24, 0.16, 0.04), mats)

    # 7b. Wireless NFC Key Fob Docking Pocket with Status LED
    make_box("Dash_NFC_Key_Pocket", (-0.12, -0.065, 0.62), (0.07, 0.04, 0.012), mats["rubber_traction"], bevel=0.002)
    make_cylinder("Dash_NFC_Status_LED", (-0.12, -0.065, 0.627), 0.003, 0.002, (0, 0, 0), mats["ambient_green"], vertices=12)

    # 8. Passenger Glove Compartment with Motorized Damper & Electric Touch Latch
    make_box("Dash_Glovebox_Door_Panel", (0.36, -0.04, 0.58), (0.52, 0.03, 0.18), mats["leather_ebony"], bevel=0.006)
    make_box("Dash_Glovebox_Release_Button", (0.15, -0.055, 0.63), (0.045, 0.010, 0.020), mats["chrome_jewel"], bevel=0.002)
    make_box("Dash_Glovebox_Touch_Sensor", (0.45, -0.056, 0.61), (0.08, 0.006, 0.016), mats["metal_brushed"], bevel=0.002)
    make_box("Dash_Glovebox_Seam_Outline", (0.36, -0.042, 0.58), (0.53, 0.002, 0.19), mats["wood_pianoblack"], bevel=0)
    make_cylinder("Dash_Glovebox_Damper_Cyl", (0.58, 0.02, 0.58), 0.007, 0.08, (math.radians(35), 0, 0), mats["titanium_finish"], vertices=16)
    make_cylinder("Dash_Glovebox_Damper_Piston", (0.58, 0.06, 0.61), 0.004, 0.06, (math.radians(35), 0, 0), mats["chrome_jewel"], vertices=16)

    # 9. Lower Climate Control Strip with Dual Knurled HVAC Barrel Rollers & Hazard Button
    make_box("Dash_Climate_Control_Bar", (0.06, -0.07, 0.62), (0.38, 0.025, 0.04), mats["wood_pianoblack"], bevel=0.003)
    make_climate_hvac_roller("Dash_Climate_Roller_L", (-0.06, -0.078, 0.62), 0.014, 0.045, (0, math.radians(90), 0), mats, temp_str="70°F")
    make_climate_hvac_roller("Dash_Climate_Roller_R", (0.18, -0.078, 0.62), 0.014, 0.045, (0, math.radians(90), 0), mats, temp_str="72°F")
    make_box("Dash_Hazard_Warning_Triangle", (0.06, -0.082, 0.62), (0.018, 0.008, 0.018), mats["anodized_red"], bevel=0.001)

    # 10. Engine Start/Stop Pushbutton & Steering Column Adjustment Stalk with Knurled Collar
    make_knurled_cylinder("Dash_Engine_Start_Bezel", (-0.15, -0.078, 0.64), 0.018, 0.010, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=24)
    make_cylinder("Dash_Engine_Start_Button", (-0.15, -0.084, 0.64), 0.014, 0.006, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=24)
    make_cylinder("Dash_Engine_Start_Halo", (-0.15, -0.083, 0.64), 0.0155, 0.002, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=24)
    make_cylinder("Dash_Column_Adjust_Stalk", (-0.58, -0.06, 0.62), 0.004, 0.040, (0, math.radians(90), 0), mats["titanium_finish"], vertices=16)
    make_knurled_cylinder("Dash_Column_Adjust_Knob", (-0.60, -0.06, 0.62), 0.007, 0.012, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=16)

    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_AR_HUD_Collimator", (-0.36, 0.18, 0.81), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Telescopic_Shroud", (-0.36, 0.02, 0.64), mats=mats)
    make_fragrance_atomizer_flacon("Dash_Glovebox_Perfume_Flacon", (0.36, 0.02, 0.58), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Exec_Cinema_Virtual", (0.0, 0.0, 0.74), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Exec_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.79), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Exec_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.79), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_sport_dashboard(output_path):
    print(f"\n[BUILD] Engineering Sport GT Dashboard -> {output_path}")
    mats = reset_scene_and_get_mats()

    dash_w = 1.44
    dash_d = 0.56

    # 1. Alcantara & Carbon Fiber Sculpted Dash Top
    make_box("Dash_Sport_Alcantara_Top", (0.0, 0.0, 0.75), (dash_w, dash_d, 0.08), mats["alcantara_charcoal"], bevel=0.015)
    make_box("Dash_Sport_Binnacle_Shroud", (-0.36, 0.06, 0.82), (0.44, 0.30, 0.08), mats["carbon_twill"], bevel=0.010)
    make_box("Dash_Sport_Red_Stitch_L", (-0.36, 0.19, 0.855), (0.42, 0.006, 0.004), mats["anodized_red"], bevel=0)
    make_box("Dash_Sport_Red_Stitch_R", (-0.36, -0.07, 0.855), (0.42, 0.006, 0.004), mats["anodized_red"], bevel=0)

    # 2. Forged Carbon Dash Fascia Spear with Amber Ambient Lightpipe
    make_box("Dash_Sport_Forged_Carbon_Spear", (0.0, -0.05, 0.71), (dash_w * 0.94, 0.04, 0.07), mats["carbon_forged"], bevel=0.006)
    make_box("Dash_Sport_Ambient_Amber_Strip", (0.0, -0.07, 0.67), (dash_w * 0.94, 0.006, 0.005), mats["ambient_amber"], bevel=0)

    # 3. Precision Turbine Air Vents with Red Anodized Knurled Bezels & 8 Angled Vanes
    for v_idx, vx in enumerate([-0.55, -0.15, 0.15, 0.55]):
        make_precision_turbine_ac_vent(f"Dash_Sport_Turbine_Vent_{v_idx+1}", (vx, -0.06, 0.71), 0.038, 0.024, (math.radians(90), 0, 0), mats, vane_count=8, illuminated=True, bezel_mat=mats["anodized_red"])

    # 4. Driver Centric Cockpit Telemetry OLED Screens
    make_box("Dash_Sport_Telemetry_Cluster", (-0.36, -0.02, 0.77), (0.40, 0.015, 0.15), mats["screen_oled"], bevel=0.002)
    make_box("Dash_Sport_Driver_Canted_Display", (0.05, -0.04, 0.74), (0.38, 0.018, 0.20), mats["screen_oled"], bevel=0.002)
    
    # 5. Launch Control & Lap Timing Pushbutton Bank
    for btn_idx, bx in enumerate([-0.06, -0.01, 0.04]):
        b_mat = mats["anodized_red"] if btn_idx == 0 else mats["metal_brushed"]
        make_box(f"Dash_Sport_Cockpit_Button_{btn_idx+1}", (bx, -0.08, 0.63), (0.035, 0.015, 0.025), b_mat, bevel=0.002)

    # 5b. Central Telemetry Aircraft Toggle Switch Bank
    make_aircraft_toggle_switch_bank("Dash_Sport_ToggleBank", (0.0, -0.075, 0.58), switch_count=4, rot_euler=(math.radians(15), 0, 0), mats=mats, carbon_plate=True)

    # 6. Elevated Sport Chrono Stopwatch Binnacle Pod with Diamond-Knurled Bezel
    make_cylinder("Dash_Sport_Chrono_Binnacle_Pod", (0.05, 0.02, 0.825), 0.040, 0.048, (math.radians(25), 0, 0), mats["alcantara_charcoal"], vertices=32, bevel=0.003)
    make_knurled_cylinder("Dash_Sport_Chrono_Chrome_Bezel", (0.05, 0.008, 0.830), 0.036, 0.008, (math.radians(25), 0, 0), mats["chrome_jewel"], ridges=28)
    make_cylinder("Dash_Sport_Chrono_Dial_Face", (0.05, 0.004, 0.832), 0.032, 0.004, (math.radians(25), 0, 0), mats["wood_pianoblack"], vertices=32)
    make_box("Dash_Sport_Chrono_Sweep_Hand", (0.05, 0.001, 0.836), (0.002, 0.001, 0.022), mats["chrono_needle"])
    make_cylinder("Dash_Sport_Chrono_Glass_Lens", (0.05, -0.002, 0.832), 0.034, 0.002, (math.radians(25), 0, 0), mats["glass_clear"], vertices=32)

    # 7. Progressive 9-Segment Motorsport Shift Light Ladder (3 Green, 2 Amber, 3 Red, 1 Cyan)
    shift_colors = [mats["ambient_green"], mats["ambient_green"], mats["ambient_green"], mats["ambient_amber"], mats["ambient_amber"], mats["anodized_red"], mats["anodized_red"], mats["anodized_red"], mats["ambient_iceblue"]]
    for s_idx in range(9):
        lx = -0.46 + s_idx * 0.025
        make_cylinder(f"Dash_Sport_Shift_LED_{s_idx+1}", (lx, -0.018, 0.852), 0.006, 0.004, (math.radians(90), 0, 0), shift_colors[s_idx], vertices=16)
        make_cylinder(f"Dash_Sport_Shift_Bezel_{s_idx+1}", (lx, -0.016, 0.852), 0.008, 0.002, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=16)

    # 7b. Skeletonized CNC Paddle Shifter Modules behind Steering Plane
    make_skeletonized_paddle("Dash_Sport_Paddle_Down", (-0.48, 0.05, 0.72), (0.032, 0.012, 0.13), (0, 0, 0), mats["carbon_twill"], mats["metal_brushed"], symbol="-")
    make_skeletonized_paddle("Dash_Sport_Paddle_Up", (-0.24, 0.05, 0.72), (0.032, 0.012, 0.13), (0, 0, 0), mats["carbon_twill"], mats["metal_brushed"], symbol="+")

    # 7c. Passenger Co-Driver Rally Computer / Lap-Timer with Tactile Pushbuttons
    make_box("Dash_Sport_Rally_Tripcomp", (0.42, -0.04, 0.72), (0.16, 0.02, 0.08), mats["wood_pianoblack"], bevel=0.002)
    make_box("Dash_Sport_Tripcomp_Screen", (0.42, -0.052, 0.72), (0.14, 0.004, 0.06), mats["screen_oled"], bevel=0.001)
    for b_i in range(3):
        make_cylinder(f"Dash_Sport_Tripcomp_Btn_{b_i+1}", (0.37 + b_i * 0.05, -0.054, 0.67), 0.006, 0.005, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=16)

    # 7d. Passenger Leather-Wrapped Carbon Grab Bar Handle with Titanium Hex Screws
    make_cylinder("Dash_Sport_Grab_Bar_Core", (0.42, 0.05, 0.68), 0.012, 0.32, (0, math.radians(90), 0), mats["carbon_twill"], vertices=24)
    make_cylinder("Dash_Sport_Grab_Bar_Leather", (0.42, 0.05, 0.68), 0.015, 0.22, (0, math.radians(90), 0), mats["alcantara_charcoal"], vertices=24)
    make_hex_bolt("Dash_Sport_Grab_Bolt_L", (0.25, 0.05, 0.68), 0.006, 0.015, (0, math.radians(90), 0), mats["titanium_finish"])
    make_hex_bolt("Dash_Sport_Grab_Bolt_R", (0.59, 0.05, 0.68), 0.006, 0.015, (0, math.radians(90), 0), mats["titanium_finish"])

    # 7e. Passenger Footwell Fire Suppression Pull Knob
    make_cylinder("Dash_Sport_Fire_Knob_Bezel", (0.52, -0.05, 0.62), 0.018, 0.012, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Dash_Sport_Fire_Pull_T_Bar", (0.52, -0.065, 0.62), 0.012, 0.025, (math.radians(90), 0, 0), mats["anodized_red"], vertices=24)

    # 8. Engine Start/Stop Button with Articulated Anodized Red Flip Safety Cover
    make_start_stop_button_with_flip_cover("Dash_Sport_Start_Stop", (-0.14, -0.075, 0.64), 0.018, 0.012, (math.radians(90), 0, 0), mats)

    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_Sport_AR_HUD_Collimator", (-0.36, 0.18, 0.81), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Sport_Telescopic_Shroud", (-0.36, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Sport_Cinema_Virtual", (0.0, 0.0, 0.73), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Sport_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.78), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Sport_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.78), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_hyper_glass_dashboard(output_path):
    print(f"\n[BUILD] Engineering Pillar-to-Pillar Hyperscreen Dashboard (v7.0 Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    dash_w = 1.52
    dash_d = 0.54

    # 1. Seamless Single-Piece Gorilla Glass Curved Blade
    make_box("Dash_Hyperscreen_Curved_Glass_Blade", (0.0, -0.03, 0.75), (dash_w * 0.96, 0.025, 0.24), mats["wood_pianoblack"], bevel=0.006)
    make_box("Dash_Hyperscreen_Outer_Metal_Frame", (0.0, -0.025, 0.75), (dash_w * 0.97, 0.030, 0.25), mats["metal_brushed"], bevel=0.004)

    # Three Integrated OLED Displays under monolithic glass
    make_box("Dash_Hyperscreen_Driver_OLED", (-0.42, -0.04, 0.75), (0.38, 0.008, 0.18), mats["screen_oled"], bevel=0.001)
    make_box("Dash_Hyperscreen_Central_OLED", (0.0, -0.04, 0.75), (0.48, 0.008, 0.21), mats["screen_oled"], bevel=0.001)
    make_box("Dash_Hyperscreen_Passenger_OLED", (0.42, -0.04, 0.75), (0.38, 0.008, 0.18), mats["screen_oled"], bevel=0.001)

    # 2. Continuous Thin-Slot HVAC Louvers & Ambient Glow
    make_box("Dash_Hyperscreen_Continuous_AC_Slot", (0.0, 0.04, 0.86), (dash_w * 0.94, 0.04, 0.018), mats["metal_brushed"], bevel=0.002)
    for ac_i in range(6):
        make_box(f"Dash_Hyperscreen_AC_Vane_{ac_i+1}", (-0.60 + ac_i * 0.24, 0.04, 0.86), (0.08, 0.02, 0.004), mats["chrome_jewel"], bevel=0.001)
    make_box("Dash_Hyperscreen_Top_Ambient_Glow", (0.0, -0.015, 0.88), (dash_w * 0.95, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)
    make_box("Dash_Hyperscreen_Bottom_Ambient_Glow", (0.0, -0.015, 0.62), (dash_w * 0.95, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)

    # 3. Micro Aerodynamic Blade Air Curtain (12 directional vanes across lower glass edge)
    for blade_i in range(12):
        bx = -0.66 + blade_i * 0.12
        make_box(f"Dash_Hyperscreen_Blade_Vane_{blade_i+1}", (bx, -0.045, 0.635), (0.045, 0.018, 0.003), mats["chrome_jewel"], bevel=0)

    # 4. Holographic Head-Up Display (HUD) Projector System
    make_hud_glass_projector("Dash_Hyperscreen_HUD", (-0.42, 0.16, 0.86), (0.24, 0.16, 0.04), mats)

    # 5. A-Pillar Motorized Rotating Burmester Acoustic Tweeter Orbs in Titanium Finish
    make_burmester_acoustic_tweeter_orb("Dash_Hyperscreen_Tweeter_L", (-dash_w * 0.48, 0.06, 0.80), (0, math.radians(45), 0), mats, finish="titanium")
    make_burmester_acoustic_tweeter_orb("Dash_Hyperscreen_Tweeter_R", (dash_w * 0.48, 0.06, 0.80), (0, math.radians(-45), 0), mats, finish="titanium")

    # Frameless Electrochromic Rearview Mirror
    make_frameless_electrochromic_mirror("Dash_Hyperscreen_Mirror", (0.0, 0.05, 0.98), (0, 0, 0), mats)

    # 6. Steering Column Cowl with Dual Electronic Adjustment Thumb Joysticks
    make_cylinder("Dash_Hyperscreen_Column", (-0.42, 0.08, 0.64), 0.048, 0.16, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=28, bevel=0.003)
    make_cylinder("Dash_Hyperscreen_Joystick_L", (-0.50, 0.06, 0.64), 0.004, 0.030, (0, math.radians(90), 0), mats["metal_brushed"], vertices=12)
    make_cylinder("Dash_Hyperscreen_Joystick_R", (-0.34, 0.06, 0.64), 0.004, 0.030, (0, math.radians(-90), 0), mats["metal_brushed"], vertices=12)

    # 7. Passenger Haptic Control Matrix with Pulse Ring
    make_box("Dash_Hyperscreen_Pass_Haptic_Pad", (0.42, -0.05, 0.64), (0.28, 0.015, 0.06), mats["rubber_traction"], bevel=0.002)
    make_cylinder("Dash_Hyperscreen_Pass_Pulse_Ring", (0.42, -0.058, 0.64), 0.018, 0.004, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=24)

    # 8. Driver Attention Monitoring Infrared Camera Pod atop steering cowl
    make_box("Dash_Hyperscreen_Driver_Cam_Pod", (-0.42, 0.02, 0.89), (0.06, 0.03, 0.015), mats["wood_pianoblack"], bevel=0.002)
    make_cylinder("Dash_Hyperscreen_Driver_Cam_Lens", (-0.42, 0.005, 0.89), 0.005, 0.004, (math.radians(90), 0, 0), mats["anodized_red"], vertices=16)

    # 9. Holographic Drive Mode Prism (Center stack floating crystal)
    make_cylinder("Dash_Hyperscreen_DriveMode_Prism", (0.0, -0.065, 0.68), 0.026, 0.018, (0, 0, 0), mats["chrome_jewel"], vertices=6, bevel=0.002)
    make_cylinder("Dash_Hyperscreen_Prism_Core", (0.0, -0.065, 0.68), 0.018, 0.012, (0, 0, 0), mats["ambient_iceblue"], vertices=6)

    # 10. Under-Dash Floating Ambient Lighting Curtain
    make_box("Dash_Hyperscreen_Under_Curtain", (0.0, -0.06, 0.58), (dash_w * 0.85, 0.02, 0.005), mats["ambient_iceblue"], bevel=0)

    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_Hyper_AR_HUD_Collimator", (-0.42, 0.18, 0.87), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Hyper_Telescopic_Shroud", (-0.42, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Hyper_Cinema_Virtual", (0.0, 0.0, 0.75), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Hyper_RibbonTweeter_L", (-dash_w * 0.48, 0.06, 0.81), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Hyper_RibbonTweeter_R", (dash_w * 0.48, 0.06, 0.81), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_classic_dashboard(output_path):
    print(f"\n[BUILD] Engineering Classic Sport Dashboard (v5.0) -> {output_path}")
    mats = reset_scene_and_get_mats()

    dash_w = 1.42
    dash_d = 0.52

    # Hand-stitched saddle leather dash cowl
    make_box("Dash_Classic_Leather_Top", (0.0, 0.0, 0.74), (dash_w, dash_d, 0.08), mats["leather_cognac"], bevel=0.014)
    make_box("Dash_Classic_Aluminum_Fascia", (0.0, -0.06, 0.68), (dash_w * 0.95, 0.025, 0.16), mats["metal_brushed"], bevel=0.006)

    # 5-Gauge Classic Instrument Cluster with Chrome Bezels & Hex Fastener Screws
    # Speedometer & Tachometer
    make_cylinder("Dash_Classic_Speedo_Bezel", (-0.32, -0.075, 0.70), 0.055, 0.025, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=40, bevel=0.003)
    make_cylinder("Dash_Classic_Speedo_Face", (-0.32, -0.085, 0.70), 0.048, 0.005, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=40)
    make_box("Dash_Classic_Speedo_Pointer", (-0.32, -0.088, 0.71), (0.002, 0.001, 0.026), mats["chrono_needle"])
    make_hex_bolt("Dash_Classic_Speedo_Screw_L", (-0.37, -0.082, 0.70), 0.003, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])
    make_hex_bolt("Dash_Classic_Speedo_Screw_R", (-0.27, -0.082, 0.70), 0.003, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])

    make_cylinder("Dash_Classic_Tach_Bezel", (-0.18, -0.075, 0.70), 0.055, 0.025, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=40, bevel=0.003)
    make_cylinder("Dash_Classic_Tach_Face", (-0.18, -0.085, 0.70), 0.048, 0.005, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=40)
    make_box("Dash_Classic_Tach_Pointer", (-0.18, -0.088, 0.71), (0.002, 0.001, 0.026), mats["chrono_needle"])
    make_hex_bolt("Dash_Classic_Tach_Screw_L", (-0.23, -0.082, 0.70), 0.003, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])
    make_hex_bolt("Dash_Classic_Tach_Screw_R", (-0.13, -0.082, 0.70), 0.003, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])

    # Knurled Mechanical Trip Meter Reset Thumb Screw
    make_knurled_cylinder("Dash_Classic_Trip_Reset", (-0.10, -0.078, 0.69), 0.005, 0.016, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=16)

    # 3 Center Auxiliary Gauges (Oil Pressure, Water Temp, Fuel)
    for aux_i, (aux_name, ax) in enumerate([("OilPress", -0.06), ("WaterTemp", 0.04), ("Fuel", 0.14)]):
        make_cylinder(f"Dash_Classic_AuxGauge_Bezel_{aux_name}", (ax, -0.075, 0.71), 0.030, 0.020, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=32, bevel=0.002)
        make_cylinder(f"Dash_Classic_AuxGauge_Face_{aux_name}", (ax, -0.083, 0.71), 0.025, 0.004, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=32)
        make_box(f"Dash_Classic_AuxGauge_Needle_{aux_name}", (ax, -0.086, 0.715), (0.0015, 0.001, 0.014), mats["chrono_needle"])

    # Row of 5 Toggle Switches with Hex Retaining Nuts
    for s_i, sx in enumerate([-0.06, -0.01, 0.04, 0.09, 0.14]):
        make_hex_bolt(f"Dash_Classic_Toggle_Nut_{s_i+1}", (sx, -0.078, 0.64), 0.007, 0.005, (math.radians(90), 0, 0), mats["chrome_jewel"])
        make_cylinder(f"Dash_Classic_Toggle_Lever_{s_i+1}", (sx, -0.09, 0.64), 0.0035, 0.022, (math.radians(-30), 0, 0), mats["chrome_jewel"], vertices=16)

    # Vintage Radio Unit with Dual Diamond-Knurled Tuning Knobs & Preset Buttons
    make_box("Dash_Classic_Radio_Face", (0.34, -0.072, 0.66), (0.22, 0.015, 0.06), mats["chrome_jewel"], bevel=0.003)
    make_knurled_cylinder("Dash_Classic_Radio_Knob_L", (0.26, -0.085, 0.66), 0.014, 0.016, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=20)
    make_knurled_cylinder("Dash_Classic_Radio_Knob_R", (0.42, -0.085, 0.66), 0.014, 0.016, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=20)
    for p_i in range(5):
        make_box(f"Dash_Classic_Radio_Preset_{p_i+1}", (0.30 + p_i * 0.02, -0.082, 0.66), (0.012, 0.008, 0.010), mats["wood_pianoblack"], bevel=0.001)

    # Pop-Out Cigarette Lighter & Pull-Out Ashtray Drawer
    make_cylinder("Dash_Classic_Cigarette_Lighter", (0.48, -0.075, 0.66), 0.012, 0.018, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=20, bevel=0.002)
    make_box("Dash_Classic_Ashtray_Drawer", (0.34, -0.07, 0.59), (0.16, 0.016, 0.05), mats["metal_brushed"], bevel=0.002)

    # Classic Passenger Glovebox Door with Push-Button Lock & Keyhole
    make_box("Dash_Classic_Glovebox_Door", (0.36, -0.05, 0.58), (0.42, 0.02, 0.16), mats["leather_cognac"], bevel=0.004)
    make_cylinder("Dash_Classic_Glovebox_Lock", (0.18, -0.062, 0.62), 0.008, 0.008, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=20)
    make_box("Dash_Classic_Keyhole_Slot", (0.18, -0.067, 0.62), (0.002, 0.002, 0.006), mats["wood_pianoblack"], bevel=0)

    # Under-Dash Manual Choke Pull Knob & Dual Heater Lever Slides
    make_cylinder("Dash_Classic_Choke_Knob", (-0.46, -0.07, 0.62), 0.010, 0.016, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=20)
    make_cylinder("Dash_Classic_Choke_Shaft", (-0.46, -0.06, 0.62), 0.003, 0.025, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)
    make_box("Dash_Classic_Heater_Slide_Base", (-0.02, -0.07, 0.60), (0.12, 0.015, 0.025), mats["metal_brushed"], bevel=0.001)
    make_cylinder("Dash_Classic_Heater_Lever_Warm", (-0.04, -0.08, 0.60), 0.003, 0.020, (math.radians(-35), 0, 0), mats["anodized_red"], vertices=12)
    make_cylinder("Dash_Classic_Heater_Lever_Cold", (0.00, -0.08, 0.60), 0.003, 0.020, (math.radians(35), 0, 0), mats["ambient_iceblue"], vertices=12)

    # Precision Chrome Turbine Air Outlets (Vintage Aircraft Style)
    for v_i, vx in enumerate([-0.54, 0.54]):
        make_precision_turbine_ac_vent(f"Dash_Classic_Turbine_Vent_{v_i+1}", (vx, -0.07, 0.70), 0.042, 0.024, (math.radians(90), 0, 0), mats, vane_count=8, illuminated=False, bezel_mat=mats["chrome_jewel"])

    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("Dash_Classic_Tourbillon", (0.04, -0.075, 0.77), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Classic_Telescopic_Shroud", (-0.25, -0.02, 0.62), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_a_pillar_ribbon_tweeter_pod("Dash_Classic_RibbonTweeter_L", (-dash_w * 0.46, 0.05, 0.76), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Classic_RibbonTweeter_R", (dash_w * 0.46, 0.05, 0.76), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_luxury_gt_dashboard(output_path):
    print(f"\n[BUILD] Engineering Luxury Grand Tourer Dashboard (v7.0 Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    dash_w = 1.48
    dash_d = 0.58

    # 1. Hand-Stitched Connolly Leather Dash Top & Instrument Binnacle Cowl
    make_box("GT_Dash_Upper_Leather_Cowl", (0.0, 0.0, 0.77), (dash_w, dash_d, 0.09), mats["leather_cognac"], bevel=0.015)
    make_box("GT_Dash_Binnacle_Shroud", (-0.36, 0.08, 0.84), (0.46, 0.32, 0.07), mats["leather_cognac"], bevel=0.012)
    make_box("GT_Dash_Contrast_Seam_L", (-0.36, 0.22, 0.875), (0.44, 0.006, 0.004), mats["stitch_contrast"], bevel=0)
    make_box("GT_Dash_Contrast_Seam_R", (-0.36, -0.06, 0.875), (0.44, 0.006, 0.004), mats["stitch_contrast"], bevel=0)

    # 2. Diamond-Quilted Lower Passenger Dash Pad
    make_box("GT_Dash_Passenger_Lower_Pad", (0.36, -0.03, 0.60), (0.54, 0.035, 0.22), mats["leather_cognac"], bevel=0.010)
    for q_row in range(3):
        for q_col in range(4):
            qx = 0.18 + q_col * 0.12
            qz = 0.53 + q_row * 0.07
            make_box(f"GT_Dash_Diamond_Quilt_Button_{q_row+1}_{q_col+1}", (qx, -0.05, qz), (0.008, 0.004, 0.008), mats["stitch_contrast"], bevel=0)

    # 3. Piano Black Waterfall Fascia with Brushed Bronze Metallic Bezels
    make_box("GT_Dash_Waterfall_Fascia", (0.0, -0.06, 0.72), (dash_w * 0.96, 0.04, 0.085), mats["wood_pianoblack"], bevel=0.006)
    make_box("GT_Dash_Bronze_Trim_Upper", (0.0, -0.075, 0.765), (dash_w * 0.96, 0.012, 0.005), mats["anodized_gold"], bevel=0.001)
    make_box("GT_Dash_Bronze_Trim_Lower", (0.0, -0.075, 0.675), (dash_w * 0.96, 0.012, 0.005), mats["anodized_gold"], bevel=0.001)
    make_box("GT_Dash_Ambient_Lightguide", (0.0, -0.08, 0.672), (dash_w * 0.95, 0.006, 0.005), mats["ambient_amber"], bevel=0)

    # 4. Breitling-Style Rotating Analog Tourbillon Timepiece with Diamond-Knurled Bezel & Micro Hands
    make_knurled_cylinder("GT_Dash_Tourbillon_Clock_Bezel", (0.05, 0.06, 0.82), 0.040, 0.024, (math.radians(35), 0, 0), mats["chrome_jewel"], ridges=36)
    make_cylinder("GT_Dash_Tourbillon_Outer_Ring", (0.05, 0.054, 0.824), 0.035, 0.004, (math.radians(35), 0, 0), mats["anodized_gold"], vertices=40)
    make_cylinder("GT_Dash_Tourbillon_Clock_Face", (0.05, 0.050, 0.826), 0.032, 0.005, (math.radians(35), 0, 0), mats["wood_pianoblack"], vertices=40)
    make_box("GT_Dash_Tourbillon_Hands", (0.05, 0.046, 0.828), (0.016, 0.016, 0.002), mats["anodized_gold"], bevel=0)
    make_cylinder("GT_Dash_Tourbillon_Center_Pinion", (0.05, 0.044, 0.828), 0.003, 0.004, (math.radians(35), 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("GT_Dash_Tourbillon_Glass", (0.05, 0.042, 0.830), 0.034, 0.002, (math.radians(35), 0, 0), mats["glass_clear"], vertices=32)

    # 4b. Rotating 3-Sided Toblerone Center Display Housing & Chromium Pivots
    make_box("GT_Dash_Toblerone_Housing", (0.06, -0.05, 0.75), (0.47, 0.03, 0.23), mats["wood_walnut"], bevel=0.004)
    make_cylinder("GT_Dash_Toblerone_Pivot_L", (-0.18, -0.05, 0.75), 0.008, 0.02, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("GT_Dash_Toblerone_Pivot_R", (0.30, -0.05, 0.75), 0.008, 0.02, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

    # 4c. Passenger Dash Luxury Chronograph Timepiece
    make_swiss_chronograph("GT_Dash_Pass_Chrono", (0.58, 0.02, 0.78), 0.030, 0.018, (math.radians(25), 0, 0), mats, ridges=24)

    # 5. Organ-Stop Mechanical Pull Vents with Precision Turbine Bezels & Knurled Organ-Stems (Bentley GT style)
    vent_coords = [-0.56, -0.16, 0.16, 0.56]
    for v_i, vx in enumerate(vent_coords):
        make_precision_turbine_ac_vent(f"GT_Dash_Turbine_{v_i+1}", (vx, -0.065, 0.73), 0.040, 0.024, (math.radians(90), 0, 0), mats, vane_count=8, illuminated=True, bezel_mat=mats["chrome_jewel"])
        make_cylinder(f"GT_Organ_Stop_Stem_{v_i+1}", (vx, -0.078, 0.67), 0.004, 0.035, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=16)
        make_knurled_cylinder(f"GT_Organ_Stop_Knob_{v_i+1}", (vx, -0.098, 0.67), 0.010, 0.015, (math.radians(90), 0, 0), mats["anodized_gold"], ridges=20)

    # 6. Ultra-Crisp Digital Instrument Cluster & Central Infotainment
    make_box("GT_Dash_Instrument_Cluster_OLED", (-0.36, -0.02, 0.78), (0.42, 0.015, 0.16), mats["screen_oled"], bevel=0.002)
    make_box("GT_Dash_Cluster_Speedo_Arc", (-0.46, -0.022, 0.78), (0.08, 0.002, 0.08), mats["screen_ui_gauge"], bevel=0)
    make_box("GT_Dash_Cluster_Tach_Arc", (-0.26, -0.022, 0.78), (0.08, 0.002, 0.08), mats["screen_ui_gauge"], bevel=0)
    make_box("GT_Dash_Center_Touchscreen", (0.06, -0.05, 0.75), (0.46, 0.018, 0.22), mats["screen_oled"], bevel=0.002)
    make_box("GT_Dash_Touchscreen_Gold_Bezel", (0.06, -0.046, 0.75), (0.475, 0.012, 0.235), mats["anodized_gold"], bevel=0.002)

    # 7. Flush 10.9-inch Passenger Interactive Display
    make_box("GT_Dash_Passenger_Display_OLED", (0.44, -0.05, 0.74), (0.34, 0.012, 0.15), mats["screen_passenger"], bevel=0.002)
    make_box("GT_Dash_Passenger_Display_Bezel", (0.44, -0.046, 0.74), (0.355, 0.008, 0.165), mats["wood_pianoblack"], bevel=0.002)

    # 8. Precision Knurled Climate Barrel Rollers & Gold-Bezeled Engine Start Button
    make_climate_hvac_roller("GT_Dash_Climate_Roller_L", (-0.08, -0.082, 0.62), 0.015, 0.048, (0, math.radians(90), 0), mats, temp_str="68°F")
    make_climate_hvac_roller("GT_Dash_Climate_Roller_R", (0.20, -0.082, 0.62), 0.015, 0.048, (0, math.radians(90), 0), mats, temp_str="72°F")
    make_knurled_cylinder("GT_Dash_Start_Bezel", (-0.15, -0.080, 0.635), 0.018, 0.012, (math.radians(90), 0, 0), mats["anodized_gold"], ridges=24)
    make_cylinder("GT_Dash_Start_Button", (-0.15, -0.086, 0.635), 0.014, 0.006, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=24)

    # 9. A-Pillar Rotating Burmester Acoustic Tweeter Orbs in 18K Rose Gold Finish
    make_burmester_acoustic_tweeter_orb("GT_Dash_Burmester_Tweeter_L", (-dash_w * 0.46, 0.05, 0.78), (0, math.radians(45), 0), mats, finish="rose_gold")
    make_burmester_acoustic_tweeter_orb("GT_Dash_Burmester_Tweeter_R", (dash_w * 0.46, 0.05, 0.78), (0, math.radians(-45), 0), mats, finish="rose_gold")

    # Frameless Electrochromic Rearview Mirror with Amber Downlight
    make_frameless_electrochromic_mirror("GT_Dash_Electrochromic_Mirror", (0.0, 0.05, 0.98), (0, 0, 0), mats)

    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("GT_Dash_Tourbillon_Escapement", (0.05, 0.06, 0.825), mats=mats)
    make_augmented_reality_hud_collimator("GT_Dash_AR_HUD_Collimator", (-0.36, 0.18, 0.82), mats=mats)
    make_steering_column_telescopic_shroud("GT_Dash_Steering_Shroud", (-0.36, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("GT_Dash_Cinema_Virtual", (0.0, 0.0, 0.75), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("GT_Dash_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.79), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("GT_Dash_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.79), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 2. DETAILED CENTER CONSOLES BUILDER
# ==============================================================================
def build_executive_center_console(output_path):
    print(f"\n[BUILD] Engineering Executive Center Console (v5.0) -> {output_path}")
    mats = reset_scene_and_get_mats()

    c_w = 0.34
    c_len = 1.18
    c_h = 0.30

    # 1. Main Bridge Console Structure centered along X=0, spanning Y=-0.50 to +0.50
    make_box("Console_Main_Tunnel_Bridge", (0.0, 0.0, 0.15), (c_w, c_len, c_h), mats["leather_ebony"], bevel=0.016)
    make_box("Console_Knee_Cushion_L", (-c_w * 0.52, 0.0, 0.18), (0.035, c_len * 0.88, 0.16), mats["leather_cognac"], bevel=0.012)
    make_box("Console_Knee_Cushion_R", (c_w * 0.52, 0.0, 0.18), (0.035, c_len * 0.88, 0.16), mats["leather_cognac"], bevel=0.012)

    # 2. Top Deck Inlay in Open-Pore Walnut Wood with Ambient Edge Lighting
    make_box("Console_Top_Deck_Wood_Inlay", (0.0, 0.0, 0.305), (c_w * 0.86, c_len * 0.94, 0.015), mats["wood_walnut"], bevel=0.006)
    make_box("Console_Ambient_Light_Edge_L", (-c_w * 0.44, 0.0, 0.308), (0.006, c_len * 0.92, 0.006), mats["ambient_iceblue"], bevel=0)
    make_box("Console_Ambient_Light_Edge_R", (c_w * 0.44, 0.0, 0.308), (0.006, c_len * 0.92, 0.006), mats["ambient_iceblue"], bevel=0)

    # 3. Jewel-Cut Diamond-Knurled Rotary Drive Controller Dial with Integrated Circular OLED Display
    make_rotary_dial_with_oled("Console_Rotary_Drive_Dial_OLED", (0.0, -0.05, 0.325), 0.045, 0.024, (0, 0, 0), mats)
    # Shortcut buttons flanking dial (Nav, Media, Tel, Home)
    for b_idx, (bx, by) in enumerate([(-0.06, -0.05), (0.06, -0.05), (0.0, -0.11), (0.0, 0.01)]):
        make_box(f"Console_Rotary_Haptic_Key_{b_idx+1}", (bx, by, 0.315), (0.025, 0.022, 0.008), mats["metal_brushed"], bevel=0.001)

    # Audio Volume Diamond-Knurled Thumb Roller
    make_knurled_cylinder("Console_Audio_Volume_Roller", (0.08, -0.05, 0.320), 0.009, 0.024, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=20)

    # 4. Precision Electronic Monostable Gear Selector Shifter with Park Button & Illuminated PRND Strip (At Y = 0.12, X = -0.06)
    make_electronic_gear_shifter("Console_Electronic_Shifter", (-0.06, 0.12, 0.315), (0.045, 0.075, 0.090), mats, crystal=False)

    # Electronic Parking Brake (EPB) pill toggle & Drive Mode pill rocker
    make_box("Console_EPB_Switch_Bezel", (-0.06, 0.02, 0.315), (0.03, 0.04, 0.01), mats["wood_pianoblack"], bevel=0.002)
    make_pill_cylinder("Console_EPB_Pull_Lever", (-0.06, 0.02, 0.326), 0.008, 0.026, (math.radians(90), 0, 0), mats["chrome_jewel"])
    make_pill_cylinder("Console_DriveMode_Rocker", (0.03, 0.02, 0.320), 0.008, 0.032, (math.radians(90), 0, 0), mats["metal_brushed"])

    # 5. Dual Thermoelectric Heated / Cooled Cupholders with Peltier Mood Halo Rings (At Y = 0.28)
    make_thermoelectric_cup_holder("Console_Thermo_Cupholders", (0.0, 0.28, 0.312), mats=mats, finish="chrome")

    # 5b. Dual Mini OLED Temperature Readouts
    make_box("Console_Temp_Display_Driver", (-0.06, 0.18, 0.315), (0.042, 0.012, 0.006), mats["screen_oled"], bevel=0.001)
    make_box("Console_Temp_Display_Pass", (0.06, 0.18, 0.315), (0.042, 0.012, 0.006), mats["screen_oled"], bevel=0.001)

    # 6. Qi Inductive Wireless Smartphone Fast Charging Tray & Tambour Roll-top (At Y = 0.44)
    make_wireless_charging_pad("Console_Qi_Charging_Pad", (0.0, 0.44, 0.308), (0.16, 0.18, 0.008), mats)
    for slat_i in range(5):
        make_box(f"Console_Tambour_Slat_{slat_i+1}", (0.0, 0.37 + slat_i * 0.016, 0.318), (0.18, 0.012, 0.006), mats["wood_walnut"], bevel=0.001)

    # 7. Split Butterfly Padded Leather Armrest Storage Lids (At Y = -0.34)
    make_box("Console_Butterfly_Armrest_Lid_L", (-0.08, -0.34, 0.34), (0.14, 0.38, 0.05), mats["leather_ebony"], bevel=0.012)
    make_box("Console_Butterfly_Armrest_Lid_R", (0.08, -0.34, 0.34), (0.14, 0.38, 0.05), mats["leather_ebony"], bevel=0.012)
    make_box("Console_Armrest_Release_Latch", (0.0, -0.14, 0.33), (0.06, 0.03, 0.015), mats["chrome_jewel"], bevel=0.002)

    # 7b. Rear Passenger 5.5-inch Wireless Touchscreen Remote Dock with Magnetic Retention
    make_box("Console_Rear_Remote_Dock", (0.0, -0.42, 0.345), (0.12, 0.08, 0.015), mats["wood_pianoblack"], bevel=0.002)
    make_box("Console_Rear_Remote_Screen", (0.0, -0.42, 0.354), (0.11, 0.07, 0.004), mats["screen_oled"], bevel=0.001)
    make_cylinder("Console_Rear_Remote_Magnet_L", (-0.04, -0.42, 0.352), 0.004, 0.002, (0, 0, 0), mats["chrome_jewel"], vertices=12)
    make_cylinder("Console_Rear_Remote_Magnet_R", (0.04, -0.42, 0.352), 0.004, 0.002, (0, 0, 0), mats["chrome_jewel"], vertices=12)

    # 8. Lower Pass-Through Floating Bridge Storage Deck with 12V Socket & USB-C Ports
    make_box("Console_Floating_Lower_Shelf", (0.0, 0.10, 0.04), (c_w * 0.78, 0.65, 0.015), mats["rubber_traction"], bevel=0.003)
    make_box("Console_Lower_USBC_Twin_Ports", (0.0, 0.38, 0.06), (0.08, 0.03, 0.02), mats["metal_brushed"], bevel=0.002)
    make_cylinder("Console_12V_Socket_Housing", (0.08, 0.38, 0.06), 0.012, 0.022, (0, math.radians(90), 0), mats["metal_brushed"], vertices=20)
    make_cylinder("Console_12V_Spring_Cap", (0.092, 0.38, 0.06), 0.013, 0.004, (0, math.radians(90), 0), mats["rubber_traction"], vertices=20)
    make_cylinder("Console_Qi_Status_LED_L", (-0.05, 0.52, 0.312), 0.003, 0.003, (0, 0, 0), mats["ambient_green"], vertices=12)
    make_cylinder("Console_Qi_Status_LED_R", (0.05, 0.52, 0.312), 0.003, 0.003, (0, 0, 0), mats["ambient_amber"], vertices=12)

    # 8b. Luxury Cabin Air Fragrance Ionizer / Atomizer Flacon
    make_fragrance_atomizer_flacon("Console_Fragrance_Flacon", (-0.11, 0.44, 0.315), mats=mats)

    # 9. Rear Climate Control Display & Louvers on console back
    make_box("Console_Rear_Climate_Screen", (0.0, -0.58, 0.22), (0.14, 0.015, 0.09), mats["screen_oled"], bevel=0.002)
    make_climate_hvac_roller("Console_Rear_HVAC_Roller", (0.0, -0.585, 0.16), 0.012, 0.035, (0, math.radians(90), 0), mats, temp_str="71°F")
    make_box("Console_Rear_HVAC_Louver_L", (-0.06, -0.58, 0.10), (0.06, 0.012, 0.05), mats["metal_brushed"], bevel=0.002)
    make_box("Console_Rear_HVAC_Louver_R", (0.06, -0.58, 0.10), (0.06, 0.012, 0.05), mats["metal_brushed"], bevel=0.002)
    make_box("Console_Rear_USBC_Ports", (0.0, -0.58, 0.04), (0.06, 0.012, 0.02), mats["metal_brushed"], bevel=0.001)

    # v13.0 Ultimate Craftsmanship Additions
    make_haptic_rotary_command_dial("Console_Haptic_MMI_Dial", (0.0, 0.08, 0.315), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("Console_Rear_VIP_Refrigerated_Bar", (0.0, -0.72, 0.16), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_inductive_phone_charging_station("Console_Inductive_Phone_Station", (0.0, 0.44, 0.315), mats=mats)

    export_active_scene_to_glb(output_path)

def build_gt3_center_console(output_path):
    print(f"\n[BUILD] Engineering GT3 Track Center Console (v7.0 Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    c_w = 0.30
    c_len = 1.05

    # 1. Exposed 3K Twill Carbon Fiber Transmission Tunnel Monocoque
    make_box("Console_GT3_Carbon_Tunnel", (0.0, 0.0, 0.15), (c_w, c_len, 0.30), mats["carbon_twill"], bevel=0.014)

    # 2. Exposed Pagani-Style Horological Gated Shifter Linkage with Heim Joints & Bellcrank
    make_exposed_horological_shifter_linkage("Console_GT3_Horological_Shifter", (0.0, 0.05, 0.28), size=(0.14, 0.20, 0.12), mats=mats, gold=True, gear=3)

    # 2b. Digital 7-Segment Gear Position Readout
    make_box("Console_GT3_Gear_Display", (0.0, 0.16, 0.315), (0.035, 0.035, 0.008), mats["screen_oled"], bevel=0.001)

    # 3. Competition Hydraulic Fly-Off Handbrake with Wilwood/AP Racing Master Cylinder & AN-Fitting
    make_hydraulic_handbrake_assembly("Console_GT3_Hydraulic_Handbrake", (0.07, -0.06, 0.30), mats=mats, finish="anodized_red")

    # 3b. Cockpit Air Blower Swivel Nozzle with Directional Gimbal
    make_cylinder("Console_GT3_Blower_Base", (0.09, -0.16, 0.32), 0.020, 0.015, (0, 0, 0), mats["titanium_finish"], vertices=24)
    make_cylinder("Console_GT3_Blower_Nozzle", (0.09, -0.16, 0.34), 0.016, 0.030, (math.radians(-30), 0, 0), mats["billet_aluminum"], vertices=24)

    # 4. Aviation-Style Tactile Toggle Switch Bank with Safety Bail Bars
    make_aircraft_toggle_switch_bank("Console_GT3_ToggleBank", (0.0, 0.22, 0.315), switch_count=4, rot_euler=(0, 0, 0), mats=mats, carbon_plate=True)

    # 4b. Knurled 12-Position Traction Control & ABS Rotary Dials
    make_knurled_cylinder("Console_GT3_TC_Knob", (-0.05, 0.12, 0.325), 0.016, 0.022, (0, 0, 0), mats["anodized_gold"], ridges=20)
    make_knurled_cylinder("Console_GT3_ABS_Knob", (0.05, 0.12, 0.325), 0.016, 0.022, (0, 0, 0), mats["ambient_iceblue"], ridges=20)

    # 5. Articulated Aircraft Starter Flip Guard & Cockpit Fire Extinguisher Knob
    make_start_stop_button_with_flip_cover("Console_GT3_Start_Stop", (-0.05, 0.34, 0.315), 0.016, 0.015, (0, 0, 0), mats)
    make_cylinder("Console_GT3_Fire_Extinguisher_Pull_Knob", (0.05, 0.34, 0.325), 0.022, 0.025, (0, 0, 0), mats["anodized_red"], vertices=32, bevel=0.002)

    # 5b. FIA Master Battery Cutoff T-Handle Switch
    make_cylinder("Console_GT3_FIA_Cutoff_Base", (0.06, -0.22, 0.315), 0.022, 0.010, (0, 0, 0), mats["anodized_gold"], vertices=24)
    make_box("Console_GT3_FIA_Cutoff_T_Handle", (0.06, -0.22, 0.33), (0.038, 0.012, 0.016), mats["anodized_red"], bevel=0.002)

    # 5c. MoTeC Motorsport Telemetry Data Logger Box with Billet Hex Screws
    make_box("Console_GT3_MoTeC_ECU", (-0.06, -0.22, 0.315), (0.075, 0.09, 0.025), mats["titanium_finish"], bevel=0.003)
    make_cylinder("Console_GT3_MoTeC_Deutsch_Connector", (-0.06, -0.165, 0.315), 0.010, 0.016, (0, math.radians(90), 0), mats["anodized_gold"], vertices=20)
    for mi, (mx, my) in enumerate([(-0.09, -0.25), (-0.03, -0.25), (-0.09, -0.19), (-0.03, -0.19)]):
        make_hex_bolt(f"Console_GT3_MoTeC_Screw_{mi+1}", (mx, my, 0.328), 0.003, 0.003, (0, 0, 0), mats["chrome_jewel"])

    # 5d. Helmet Drink System Quick-Disconnect Coupler
    make_cylinder("Console_GT3_Drink_Coupler", (-0.07, 0.14, 0.318), 0.008, 0.018, (0, 0, 0), mats["anodized_red"], vertices=20, bevel=0.002)

    # 6. Mechanical Brake Bias Dial with Dual Balance Readout
    make_knurled_cylinder("Console_GT3_Brake_Bias_Knob", (0.0, -0.34, 0.315), 0.028, 0.025, (0, 0, 0), mats["anodized_gold"], ridges=28)

    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck("Console_GT3_Nav_Gooseneck", (-0.11, 0.35, 0.28), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_pit_radio_comms_and_ptt_assembly("Console_GT3_Pit_Radio_Comms", (0.08, -0.22, 0.28), mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 3. DETAILED STEERING WHEELS BUILDER
# ==============================================================================
def build_sport_steering_wheel(output_path):
    print(f"\n[BUILD] Engineering Sport 3-Spoke Steering Wheel (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    rim_r = 0.185
    tube_r = 0.017

    # 1. Contoured D-Cut Flat-Bottom Torus Rim
    make_torus("Steer_Rim_Torus_Core", (0.0, 0.0, 0.0), rim_r, tube_r, (math.radians(90), 0, 0), mats["leather_ebony"])
    make_box("Steer_12OClock_Racing_Stripe", (0.0, 0.0, rim_r), (tube_r * 2.2, tube_r * 2.2, 0.02), mats["anodized_red"], bevel=0.001)

    # 1b. 36-Point Contrast French Cross-Stitch Lacing along Inside Rim Perimeter
    for s_i in range(36):
        s_ang = s_i * (2.0 * math.pi / 36.0)
        r_stitch = rim_r - tube_r * 0.82
        sx = r_stitch * math.cos(s_ang)
        sz = r_stitch * math.sin(s_ang)
        sy = 0.003 if (s_i % 2 == 0) else -0.003
        rot_z = s_ang + (math.pi / 4.0 if (s_i % 2 == 0) else -math.pi / 4.0)
        make_cylinder(f"Steer_Cross_Stitch_{s_i+1}", (sx, sy, sz), 0.0016, 0.006, (0, 0, rot_z), mats["stitch_contrast"], vertices=8)

    # 4-Quadrant Grip Dividing Stitch Rings
    for q_idx, (qx, qz) in enumerate([(-rim_r * 0.707, rim_r * 0.707), (rim_r * 0.707, rim_r * 0.707), (-rim_r * 0.707, -rim_r * 0.707), (rim_r * 0.707, -rim_r * 0.707)]):
        make_cylinder(f"Steer_Grip_Stitch_Ring_{q_idx+1}", (qx, 0.0, qz), tube_r * 1.05, 0.004, (0, 0, 0), mats["stitch_contrast"], vertices=24)

    # Anatomical 10-and-2 thumb rests
    make_cylinder("Steer_Thumb_Rest_L", (-rim_r * 0.72, 0.0, rim_r * 0.70), tube_r * 1.3, 0.05, (0, math.radians(45), 0), mats["leather_perforated"], vertices=24)
    make_cylinder("Steer_Thumb_Rest_R", (rim_r * 0.72, 0.0, rim_r * 0.70), tube_r * 1.3, 0.05, (0, math.radians(-45), 0), mats["leather_perforated"], vertices=24)

    # 2. Satin Brushed Aluminum 3-Spoke Skeletal Center Frame with Lightening Slots
    make_box("Steer_Spoke_Left", (-rim_r * 0.48, 0.0, 0.0), (rim_r * 0.55, 0.015, 0.05), mats["metal_brushed"], bevel=0.003)
    make_box("Steer_Spoke_Right", (rim_r * 0.48, 0.0, 0.0), (rim_r * 0.55, 0.015, 0.05), mats["metal_brushed"], bevel=0.003)
    make_box("Steer_Spoke_Bottom_L", (-0.025, 0.0, -rim_r * 0.48), (0.018, 0.015, rim_r * 0.55), mats["metal_brushed"], bevel=0.002)
    make_box("Steer_Spoke_Bottom_R", (0.025, 0.0, -rim_r * 0.48), (0.018, 0.015, rim_r * 0.55), mats["metal_brushed"], bevel=0.002)

    # Spoke Metal Thumb Horn Buttons
    for h_side, hx in [("L", -0.065), ("R", 0.065)]:
        make_cylinder(f"Steer_Horn_Button_{h_side}", (hx, -0.020, -0.005), 0.007, 0.005, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=20, bevel=0.001)
        make_box(f"Steer_Horn_Icon_{h_side}", (hx, -0.023, -0.005), (0.005, 0.002, 0.003), mats["chrome_jewel"])

    # 3. Leather-Wrapped Center Airbag Horn Boss with 6x Grade 12.9 Titanium Hub Fasteners
    make_cylinder("Steer_Center_Airbag_Boss", (0.0, -0.012, 0.0), 0.068, 0.035, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=40, bevel=0.006)
    make_cylinder("Steer_Center_Emblem_Ring", (0.0, -0.032, 0.0), 0.035, 0.006, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=40)
    make_box("Steer_Emblem_Shield_Crest", (0.0, -0.036, 0.0), (0.022, 0.004, 0.026), mats["anodized_gold"], bevel=0.001)
    for b_i in range(6):
        ang = b_i * (math.pi / 3.0)
        bx = 0.052 * math.cos(ang)
        bz = 0.052 * math.sin(ang)
        make_hex_bolt(f"Steer_Hub_Bolt_{b_i+1}", (bx, -0.030, bz), 0.0045, 0.005, (math.radians(90), 0, 0), mats["titanium_finish"])

    # 4. Multi-Function Capacitive Thumb Switchpacks & Diamond-Knurled Scrolling Thumbwheels
    for side, sx in [("L", -0.09), ("R", 0.09)]:
        make_box(f"Steer_Thumb_Switchpack_{side}", (sx, -0.018, 0.0), (0.055, 0.018, 0.04), mats["wood_pianoblack"], bevel=0.002)
        make_knurled_cylinder(f"Steer_Scroll_Roller_{side}", (sx, -0.028, 0.012), 0.008, 0.022, (0, math.radians(90), 0), mats["metal_brushed"], ridges=20)
        make_box(f"Steer_Button_Vol_Up_{side}", (sx, -0.028, -0.012), (0.018, 0.004, 0.012), mats["metal_brushed"], bevel=0.001)

    make_knurled_cylinder("Steer_Spoke_Scroll_Wheel_L", (-0.08, -0.018, 0.012), 0.0065, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)
    make_knurled_cylinder("Steer_Spoke_Scroll_Wheel_R", (0.08, -0.018, 0.012), 0.0065, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)

    # 5. Column-Mounted Tactile Magnetic Paddle Shifters & Thumb Encoders (+Y is behind wheel)
    make_steering_thumb_encoders_and_magnetic_paddles("Steer_Motorsport_Controls", (0.0, 0.0, 0.0), yoke_w=rim_r * 2.0, yoke_h=rim_r * 2.0, mats=mats, stripe_color="red")
    for p_side, px in [("Downshift_L", -0.16), ("Upshift_R", 0.16)]:
        make_box(f"Steer_Paddle_Pivot_Hinge_{p_side}", (px * 0.75, 0.04, -0.02), (0.018, 0.025, 0.02), mats["titanium_finish"], bevel=0.002)
        make_hex_bolt(f"Steer_Paddle_Pivot_Bolt_{p_side}", (px * 0.75, 0.04, -0.02), 0.005, 0.024, (0, 0, 0), mats["titanium_finish"])
        make_paddle_micro_switch(f"Steer_Paddle_Switch_{p_side}", (px * 0.75, 0.038, -0.01), (0.012, 0.016, 0.018), mats)

    # 6. Rotary Drive Mode Selector Dial (Manettino knob) with 5-LED Detent Arc
    make_knurled_cylinder("Steer_Manettino_Mode_Knob", (0.075, -0.028, -0.065), 0.016, 0.018, (math.radians(90), 0, 0), mats["anodized_red"], ridges=24)
    mode_led_mats = [mats["stitch_contrast"], mats["ambient_amber"], mats["anodized_red"], mats["shift_led_magenta"], mats["ambient_iceblue"]]
    for m_i, m_mat in enumerate(mode_led_mats):
        m_ang = math.radians(-40 + m_i * 20)
        mx = 0.075 + 0.024 * math.cos(m_ang)
        mz = -0.065 + 0.024 * math.sin(m_ang)
        make_cylinder(f"Steer_Manettino_LED_{m_i+1}", (mx, -0.026, mz), 0.0025, 0.003, (math.radians(90), 0, 0), m_mat, vertices=12)

    # 6b. Anatomical Finger Contour Scallops on Back of Rim
    for f_idx in range(6):
        f_ang = math.radians(60 + f_idx * 40)
        fx = (rim_r - tube_r * 0.2) * math.cos(f_ang)
        fz = (rim_r - tube_r * 0.2) * math.sin(f_ang)
        make_cylinder(f"Steer_Finger_Grip_Ridge_{f_idx+1}", (fx, 0.014, fz), tube_r * 0.85, 0.022, (0, 0, f_ang), mats["leather_perforated"], vertices=16)

    # 7. Steering Column Housing & Multi-Function Stalk Control Module
    make_cylinder("Steer_Column_Housing", (0.0, 0.10, 0.0), 0.052, 0.18, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=28, bevel=0.004)
    make_steering_column_stalk_module("Steer_Stalk_Cluster", (0.0, 0.08, 0.0), mats)

    # v13.0 Ultimate Craftsmanship Additions
    make_steering_column_telescopic_shroud("Steer_Sport_Telescopic_Shroud", (0.0, 0.08, 0.0), mats=mats)

    # v14.0 Ultimate Additions
    make_steering_column_quick_release_spline_hub("Steer_Sport_Quick_Release", (0.0, 0.04, 0.0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_gt3_yoke_steering_wheel(output_path):
    print(f"\n[BUILD] Engineering GT3 Carbon Yoke Steering Wheel (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    yoke_w = 0.28
    yoke_h = 0.18

    # 1. Monocoque Carbon Fiber Racing Yoke Plate
    make_box("Yoke_Carbon_Chassis_Plate", (0.0, 0.0, 0.0), (yoke_w, 0.025, yoke_h), mats["carbon_twill"], bevel=0.006)

    # 2. Dual Ergonomic Suede/Alcantara Hand Grips
    make_cylinder("Yoke_HandGrip_Left", (-yoke_w * 0.46, 0.0, 0.0), 0.022, yoke_h * 0.95, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.004)
    make_cylinder("Yoke_HandGrip_Right", (yoke_w * 0.46, 0.0, 0.0), 0.022, yoke_h * 0.95, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.004)

    # 3. Center Quick-Release Boss with 6x Grade 12.9 Titanium Hex Fasteners
    make_cylinder("Yoke_Quick_Release_Hub", (0.0, -0.010, -0.015), 0.042, 0.022, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=32, bevel=0.002)
    for b_i in range(6):
        ang = b_i * (math.pi / 3.0)
        bx = 0.030 * math.cos(ang)
        bz = -0.015 + 0.030 * math.sin(ang)
        make_hex_bolt(f"Yoke_Hub_Bolt_{b_i+1}", (bx, -0.022, bz), 0.004, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])

    # Quick-release spline teeth ring on column interface
    make_cylinder("Yoke_Spline_Teeth_Collar", (0.0, 0.025, -0.015), 0.036, 0.018, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=24, bevel=0.001)

    # Coiled Radio / Telemetry Communications Harness Cable with Gold LEMO Connector
    make_spring_coil("Yoke_Spiral_Comms_Cable", (0.0, 0.06, -0.04), 0.012, 0.004, 8, 0.002, (math.radians(90), 0, 0), mats["rubber_traction"])
    make_cylinder("Yoke_Comms_LEMO_Connector", (0.0, 0.12, -0.04), 0.008, 0.020, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=18, bevel=0.002)

    # 4. Integrated 4.3-inch Telemetry OLED Screen with Anti-Glare Carbon Cowl
    make_box("Yoke_Telemetry_OLED_Display", (0.0, -0.012, 0.045), (0.13, 0.008, 0.070), mats["screen_oled"], bevel=0.001)
    make_box("Yoke_RPM_Light_Hood", (0.0, -0.018, 0.092), (0.125, 0.012, 0.008), mats["carbon_forged"], bevel=0.001)

    # 10-Segment Progressive RPM Shift Light Ladder
    shift_led_colors = [mats["ambient_green"]]*3 + [mats["ambient_amber"]]*3 + [mats["anodized_red"]]*2 + [mats["shift_led_magenta"]]*2
    for led_idx, l_mat in enumerate(shift_led_colors):
        lx = -0.054 + led_idx * 0.012
        make_cylinder(f"Yoke_RPM_Shift_LED_{led_idx+1}", (lx, -0.014, 0.086), 0.0035, 0.005, (math.radians(90), 0, 0), l_mat, vertices=16)

    # 5. 8 Tactile Motorsport Pushbuttons
    btn_coords = [
        ("Pit_Limiter", -0.07, 0.05, mats["anodized_gold"]),
        ("Radio_PTT", 0.07, 0.05, mats["ambient_iceblue"]),
        ("HighBeam_Flash", -0.07, 0.01, mats["metal_brushed"]),
        ("FCY_Speed", 0.07, 0.01, mats["anodized_red"]),
        ("Neutral_Select", -0.07, -0.03, mats["wood_pianoblack"]),
        ("DRS_Wing", 0.07, -0.03, mats["metal_brushed"]),
        ("Drink_Valve", -0.035, -0.06, mats["ambient_iceblue"]),
        ("Launch_Ctrl", 0.035, -0.06, mats["anodized_red"]),
    ]
    for b_name, bx, bz, b_mat in btn_coords:
        make_cylinder(f"Yoke_Pushbutton_{b_name}", (bx, -0.014, bz), 0.009, 0.012, (math.radians(90), 0, 0), b_mat, vertices=20, bevel=0.001)

    # 6. Central Rotary Encoders (TC & ABS) + Upper Horn Thumb Rotaries
    make_knurled_cylinder("Yoke_Rotary_TC_Dial", (-0.035, -0.015, -0.015), 0.015, 0.016, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=20)
    make_knurled_cylinder("Yoke_Rotary_ABS_Dial", (0.035, -0.015, -0.015), 0.015, 0.016, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=20)
    make_knurled_cylinder("Yoke_Upper_Thumb_Rotary_L", (-yoke_w * 0.35, -0.016, yoke_h * 0.42), 0.009, 0.018, (0, math.radians(90), 0), mats["metal_brushed"], ridges=20)
    make_knurled_cylinder("Yoke_Upper_Thumb_Rotary_R", (yoke_w * 0.35, -0.016, yoke_h * 0.42), 0.009, 0.018, (0, math.radians(90), 0), mats["metal_brushed"], ridges=20)

    # 7. Carbon Fiber Magnetic Paddle Shifters & CNC Thumb Encoders with Neodymium Discs
    make_steering_thumb_encoders_and_magnetic_paddles("Yoke_Motorsport_Controls", (0.0, 0.0, 0.0), yoke_w=yoke_w, yoke_h=yoke_h, mats=mats, stripe_color="yellow")
    make_hex_bolt("Yoke_Paddle_Bolt_L", (-0.095, 0.025, 0.02), 0.004, 0.018, (0, 0, 0), mats["titanium_finish"])
    make_hex_bolt("Yoke_Paddle_Bolt_R", (0.095, 0.025, 0.02), 0.004, 0.018, (0, 0, 0), mats["titanium_finish"])
    make_paddle_micro_switch("Yoke_Paddle_Switch_L", (-0.095, 0.022, 0.02), (0.012, 0.016, 0.018), mats)
    make_paddle_micro_switch("Yoke_Paddle_Switch_R", (0.095, 0.022, 0.02), (0.012, 0.016, 0.018), mats)
    make_box("Yoke_Clutch_Paddle_L", (-0.09, 0.028, -0.05), (0.025, 0.006, 0.07), mats["metal_brushed"], bevel=0.002)
    make_box("Yoke_Clutch_Paddle_R", (0.09, 0.028, -0.05), (0.025, 0.006, 0.07), mats["metal_brushed"], bevel=0.002)

    # v13.0 Ultimate Craftsmanship Additions
    make_steering_column_telescopic_shroud("Yoke_Telescopic_Shroud", (0.0, 0.08, 0.0), mats=mats)

    # v14.0 Ultimate Additions
    make_steering_column_quick_release_spline_hub("Steer_Yoke_Quick_Release", (0.0, 0.04, 0.0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_luxury_3spoke_wheel(output_path):
    print(f"\n[BUILD] Engineering Luxury 3-Spoke Wheel (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    rim_r = 0.190
    tube_r = 0.018

    # 1. Segmented Wood Walnut & Cognac Nappa Leather Torus Rim
    make_torus("Steer_Lux_Wood_Rim", (0.0, 0.0, 0.0), rim_r, tube_r, (math.radians(90), 0, 0), mats["wood_walnut"])
    make_torus("Steer_Lux_Chrome_Inner_Ring", (0.0, 0.0, 0.0), rim_r * 0.88, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])

    # Inlaid Chrome Dividing Rings separating wood and leather rim sections
    for d_deg in [45, 135, 225, 315]:
        ang = math.radians(d_deg)
        dx = rim_r * math.cos(ang)
        dz = rim_r * math.sin(ang)
        make_cylinder(f"Steer_Lux_Trim_Band_{d_deg}", (dx, 0.0, dz), tube_r * 1.06, 0.004, (0, 0, ang), mats["chrome_jewel"], vertices=24)

    # 2. Polished Chrome Spokes with Knurled Scroll Rollers & Skeleton Windows
    make_box("Steer_Lux_Spoke_L", (-rim_r * 0.45, 0.0, 0.0), (rim_r * 0.50, 0.014, 0.045), mats["chrome_jewel"], bevel=0.003)
    make_box("Steer_Lux_Spoke_R", (rim_r * 0.45, 0.0, 0.0), (rim_r * 0.50, 0.014, 0.045), mats["chrome_jewel"], bevel=0.003)
    make_box("Steer_Lux_Spoke_B", (0.0, 0.0, -rim_r * 0.45), (0.045, 0.014, rim_r * 0.50), mats["chrome_jewel"], bevel=0.003)
    make_box("Steer_Lux_Lower_Spoke_Opening", (0.0, 0.0, -rim_r * 0.46), (0.024, 0.020, rim_r * 0.35), mats["chrome_jewel"], bevel=0.002)

    make_knurled_cylinder("Steer_Lux_Scroll_L", (-0.08, -0.016, 0.005), 0.006, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)
    make_knurled_cylinder("Steer_Lux_Scroll_R", (0.08, -0.016, 0.005), 0.006, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)

    # 3. Cognac Nappa Leather Airbag Center with Contrast Stitch Halo, 6x Chrome Perimeter Fasteners & Crest
    make_cylinder("Steer_Lux_Center_Boss", (0.0, -0.012, 0.0), 0.072, 0.032, (math.radians(90), 0, 0), mats["leather_cognac"], vertices=40, bevel=0.006)
    make_cylinder("Steer_Lux_Airbag_Stitch_Halo", (0.0, -0.015, 0.0), 0.076, 0.003, (math.radians(90), 0, 0), mats["stitch_contrast"], vertices=40)
    make_cylinder("Steer_Lux_Emblem_Crest", (0.0, -0.030, 0.0), 0.038, 0.006, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=40)
    for b_i in range(6):
        ang = b_i * (math.pi / 3.0)
        bx = 0.055 * math.cos(ang)
        bz = 0.055 * math.sin(ang)
        make_hex_bolt(f"Steer_Lux_Boss_Bolt_{b_i+1}", (bx, -0.028, bz), 0.004, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"])

    # Heated Wheel Sensor Icon & Lower Spoke Ambient Accent
    make_cylinder("Steer_Lux_Heated_Wheel_Icon", (0.0, -0.025, -0.045), 0.006, 0.004, (math.radians(90), 0, 0), mats["ambient_amber"], vertices=16)

    # 4. Anatomical Rear Finger Grooves (8 positions)
    for fg_i in range(8):
        fg_ang = math.radians(30 + fg_i * 38)
        fg_x = (rim_r - tube_r * 0.15) * math.cos(fg_ang)
        fg_z = (rim_r - tube_r * 0.15) * math.sin(fg_ang)
        make_cylinder(f"Steer_Lux_Finger_Rest_{fg_i+1}", (fg_x, 0.014, fg_z), tube_r * 0.82, 0.018, (0, 0, fg_ang), mats["leather_cognac"], vertices=16)

    # 5. Steering Column Housing & Multi-Function Stalk Control Module
    make_cylinder("Steer_Lux_Column_Housing", (0.0, 0.10, 0.0), 0.052, 0.18, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=28, bevel=0.004)
    make_steering_column_stalk_module("Steer_Lux_Stalk_Cluster", (0.0, 0.08, 0.0), mats)

    # v13.0 Ultimate Craftsmanship Additions
    make_steering_column_telescopic_shroud("Steer_Lux_Telescopic_Shroud", (0.0, 0.08, 0.0), mats=mats)

    # v14.0 Ultimate Additions
    make_steering_column_quick_release_spline_hub("Steer_Luxury_Quick_Release", (0.0, 0.04, 0.0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_suede_carbon_steering_wheel(output_path):
    print(f"\n[BUILD] Engineering Suede & Forged Carbon Steering Wheel (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    rim_r = 0.185
    tube_r = 0.017

    # 1. Full Charcoal Alcantara Rim with 12 O'Clock Dual Centering Stripe (Yellow + Black)
    make_torus("Steer_Suede_Rim_Core", (0.0, 0.0, 0.0), rim_r, tube_r, (math.radians(90), 0, 0), mats["alcantara_charcoal"])
    make_box("Steer_Centering_Stripe_Yellow_1", (-0.008, 0.0, rim_r), (0.007, tube_r * 2.2, 0.022), mats["stripe_yellow"], bevel=0.001)
    make_box("Steer_Centering_Stripe_Yellow_2", (0.008, 0.0, rim_r), (0.007, tube_r * 2.2, 0.022), mats["stripe_yellow"], bevel=0.001)

    # 1b. 32-Point Contrast Cross-Stitch Lacing on Inside of Suede Rim
    for s_i in range(32):
        s_ang = s_i * (2.0 * math.pi / 32.0)
        r_stitch = rim_r - tube_r * 0.80
        sx = r_stitch * math.cos(s_ang)
        sz = r_stitch * math.sin(s_ang)
        sy = 0.002 if (s_i % 2 == 0) else -0.002
        make_cylinder(f"Steer_Suede_Stitch_{s_i+1}", (sx, sy, sz), 0.0015, 0.005, (0, 0, s_ang), mats["stitch_contrast"], vertices=8)

    # 2. Ergonomic 10-and-2 Suede Palm Swells
    make_cylinder("Steer_Suede_Palm_L", (-rim_r * 0.72, 0.0, rim_r * 0.70), tube_r * 1.35, 0.055, (0, math.radians(45), 0), mats["alcantara_charcoal"], vertices=24)
    make_cylinder("Steer_Suede_Palm_R", (rim_r * 0.72, 0.0, rim_r * 0.70), tube_r * 1.35, 0.055, (0, math.radians(-45), 0), mats["alcantara_charcoal"], vertices=24)

    # 3. Skeletonized 3K Twill Carbon Spokes with Chamfered Lightening Cutouts
    make_box("Steer_Carbon_Spoke_L", (-rim_r * 0.48, 0.0, 0.0), (rim_r * 0.55, 0.014, 0.052), mats["carbon_twill"], bevel=0.003)
    make_box("Steer_Carbon_Spoke_R", (rim_r * 0.48, 0.0, 0.0), (rim_r * 0.55, 0.014, 0.052), mats["carbon_twill"], bevel=0.003)
    make_box("Steer_Carbon_Spoke_Window_L", (-rim_r * 0.48, 0.0, 0.0), (rim_r * 0.28, 0.018, 0.022), mats["metal_brushed"], bevel=0.001)
    make_box("Steer_Carbon_Spoke_Window_R", (rim_r * 0.48, 0.0, 0.0), (rim_r * 0.28, 0.018, 0.022), mats["metal_brushed"], bevel=0.001)
    make_box("Steer_Carbon_Spoke_B", (0.0, 0.0, -rim_r * 0.48), (0.048, 0.014, rim_r * 0.55), mats["carbon_twill"], bevel=0.003)

    # 4. Carbon Center Boss with 6x Titanium Fasteners and Metal Shield Emblem
    make_cylinder("Steer_Carbon_Center_Boss", (0.0, -0.012, 0.0), 0.068, 0.035, (math.radians(90), 0, 0), mats["carbon_twill"], vertices=40, bevel=0.005)
    make_cylinder("Steer_Carbon_Emblem_Ring", (0.0, -0.032, 0.0), 0.035, 0.006, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=40)
    make_box("Steer_Carbon_Emblem_Shield", (0.0, -0.036, 0.0), (0.022, 0.004, 0.026), mats["anodized_gold"], bevel=0.001)
    for b_i in range(6):
        ang = b_i * (math.pi / 3.0)
        bx = 0.052 * math.cos(ang)
        bz = 0.052 * math.sin(ang)
        make_hex_bolt(f"Steer_Carbon_Hub_Bolt_{b_i+1}", (bx, -0.030, bz), 0.0045, 0.005, (math.radians(90), 0, 0), mats["titanium_finish"])

    # 5. Knurled Thumb Scroll Rollers, Capacitive Switchpacks & Tactile Horn Clickers
    for side, sx in [("L", -0.09), ("R", 0.09)]:
        make_box(f"Steer_Carbon_Switchpack_{side}", (sx, -0.018, 0.0), (0.055, 0.018, 0.04), mats["wood_pianoblack"], bevel=0.002)
        make_knurled_cylinder(f"Steer_Carbon_Roller_{side}", (sx, -0.028, 0.012), 0.008, 0.022, (0, math.radians(90), 0), mats["metal_brushed"], ridges=20)
    make_cylinder("Steer_Carbon_Clicker_L", (-0.055, -0.022, 0.015), 0.005, 0.008, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=16)
    make_cylinder("Steer_Carbon_Clicker_R", (0.055, -0.022, 0.015), 0.005, 0.008, (math.radians(90), 0, 0), mats["anodized_red"], vertices=16)

    # 6. Titanium Magnetic Shift Paddles with Weight-Relief Slots & Thumb Encoders
    make_steering_thumb_encoders_and_magnetic_paddles("Suede_Motorsport_Controls", (0.0, 0.0, 0.0), yoke_w=rim_r * 2.0, yoke_h=rim_r * 2.0, mats=mats, stripe_color="yellow")
    for p_side, px in [("Downshift_L", -0.16), ("Upshift_R", 0.16)]:
        make_box(f"Steer_Ti_Paddle_Hinge_{p_side}", (px * 0.75, 0.04, -0.02), (0.018, 0.025, 0.02), mats["titanium_finish"], bevel=0.002)
        make_hex_bolt(f"Steer_Ti_Paddle_Bolt_{p_side}", (px * 0.75, 0.04, -0.02), 0.005, 0.024, (0, 0, 0), mats["titanium_finish"])
        make_paddle_micro_switch(f"Steer_Ti_Paddle_Switch_{p_side}", (px * 0.75, 0.038, -0.01), (0.012, 0.016, 0.018), mats)

    # 7. Red Race Start Button & Diamond-Knurled Manettino Drive Mode Dial
    make_cylinder("Steer_Race_Start_Btn", (-0.075, -0.028, -0.065), 0.015, 0.015, (math.radians(90), 0, 0), mats["anodized_red"], vertices=24, bevel=0.002)
    make_knurled_cylinder("Steer_Manettino_Dial", (0.075, -0.028, -0.065), 0.016, 0.018, (math.radians(90), 0, 0), mats["anodized_gold"], ridges=24)

    # 8. Steering Column Housing & Multi-Function Stalk Control Module
    make_cylinder("Steer_Column_Housing", (0.0, 0.10, 0.0), 0.052, 0.18, (math.radians(90), 0, 0), mats["leather_ebony"], vertices=28, bevel=0.004)
    make_steering_column_stalk_module("Steer_Suede_Stalk_Cluster", (0.0, 0.08, 0.0), mats)

    # v13.0 Ultimate Craftsmanship Additions
    make_steering_column_telescopic_shroud("Steer_Suede_Telescopic_Shroud", (0.0, 0.08, 0.0), mats=mats)

    # v14.0 Ultimate Additions
    make_steering_column_quick_release_spline_hub("Steer_Suede_Quick_Release", (0.0, 0.04, 0.0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_formula_steering_wheel(output_path):
    print(f"\n[BUILD] Engineering Open-Top Butterfly Formula Wheel (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    yoke_w = 0.28
    yoke_h = 0.17

    # 1. Monocoque CNC Billet & Carbon Butterfly Yoke Chassis
    make_box("Formula_Carbon_Chassis_Plate", (0.0, 0.0, 0.0), (yoke_w, 0.024, yoke_h), mats["carbon_twill"], bevel=0.006)
    make_box("Formula_Top_Arch_Cutout", (0.0, 0.0, yoke_h * 0.42), (yoke_w * 0.48, 0.030, 0.05), mats["metal_brushed"], bevel=0.002)

    # 2. Molded Ergonomic Silicone Hand Grips
    make_cylinder("Formula_HandGrip_L", (-yoke_w * 0.48, 0.0, -0.01), 0.024, yoke_h * 0.90, (0, 0, 0), mats["rubber_traction"], vertices=24, bevel=0.004)
    make_cylinder("Formula_HandGrip_R", (yoke_w * 0.48, 0.0, -0.01), 0.024, yoke_h * 0.90, (0, 0, 0), mats["rubber_traction"], vertices=24, bevel=0.004)

    # 3. 5.0" High-Refresh Telemetry OLED Screen
    make_box("Formula_Telemetry_OLED", (0.0, -0.012, 0.025), (0.135, 0.008, 0.078), mats["screen_oled"], bevel=0.001)

    # 4. Curved 15-LED RPM Shift Light Bar (Green -> Amber -> Red -> Magenta)
    shift_mats = (
        [mats["ambient_green"]] * 4 +
        [mats["ambient_amber"]] * 4 +
        [mats["anodized_red"]] * 4 +
        [mats["shift_led_magenta"]] * 3
    )
    for led_i, l_mat in enumerate(shift_mats):
        lx = -0.065 + led_i * 0.0093
        lz = 0.076 + 0.004 * (1.0 - (lx / 0.07)**2)
        make_cylinder(f"Formula_RPM_LED_{led_i+1}", (lx, -0.014, lz), 0.0035, 0.004, (math.radians(90), 0, 0), l_mat, vertices=16)

    # 5. Three Central Diamond-Knurled Rotary Encoders: Engine Map (Gold), TC (Cyan), Brake Bias (Red)
    rotary_configs = [
        ("Engine_Map", -0.045, -0.04, mats["anodized_gold"]),
        ("Traction_Ctrl", 0.0, -0.045, mats["ambient_iceblue"]),
        ("Brake_Bias", 0.045, -0.04, mats["anodized_red"]),
    ]
    for r_name, rx, rz, r_mat in rotary_configs:
        make_knurled_cylinder(f"Formula_Rotary_{r_name}_Knob", (rx, -0.016, rz), 0.014, 0.018, (math.radians(90), 0, 0), r_mat, ridges=22)
        make_cylinder(f"Formula_Rotary_{r_name}_Pointer", (rx, -0.026, rz + 0.008), 0.002, 0.008, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)

    # Upper Horn Differential Rotary Encoders (Entry / Mid-Corner)
    make_knurled_cylinder("Formula_Diff_Entry_Knob", (-0.085, -0.018, 0.075), 0.010, 0.015, (0, math.radians(90), 0), mats["anodized_gold"], ridges=18)
    make_knurled_cylinder("Formula_Diff_Mid_Knob", (0.085, -0.018, 0.075), 0.010, 0.015, (0, math.radians(90), 0), mats["anodized_red"], ridges=18)

    # Upper Thumb Rotary Encoders on Steering Horns
    make_knurled_cylinder("Formula_Thumb_Rotary_L", (-0.08, -0.016, 0.04), 0.008, 0.016, (0, math.radians(90), 0), mats["metal_brushed"], ridges=18)
    make_knurled_cylinder("Formula_Thumb_Rotary_R", (0.08, -0.016, 0.04), 0.008, 0.016, (0, math.radians(90), 0), mats["metal_brushed"], ridges=18)

    # 6. Central Hub with 6x Grade 12.9 Titanium Quick Release Fasteners & 12 Spline Teeth
    make_cylinder("Formula_Spline_Hub_Base", (0.0, 0.04, -0.010), 0.035, 0.05, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=24, bevel=0.002)
    for t_i in range(12):
        t_ang = t_i * (math.pi / 6.0)
        tx = 0.032 * math.cos(t_ang)
        tz = -0.010 + 0.032 * math.sin(t_ang)
        make_box(f"Formula_Spline_Tooth_{t_i+1}", (tx, 0.045, tz), (0.004, 0.035, 0.004), mats["metal_brushed"], bevel=0.0005)

    for b_i in range(6):
        ang = b_i * (math.pi / 3.0)
        bx = 0.025 * math.cos(ang)
        bz = -0.010 + 0.025 * math.sin(ang)
        make_hex_bolt(f"Formula_Hub_Bolt_{b_i+1}", (bx, -0.015, bz), 0.0035, 0.004, (math.radians(90), 0, 0), mats["titanium_finish"])

    # Coiled Telemetry Cable Loom
    make_spring_coil("Formula_Telemetry_Coil", (0.0, 0.08, -0.04), 0.014, 0.004, 7, 0.002, (math.radians(90), 0, 0), mats["rubber_traction"])

    # 7. PIT Lane Limiter Toggle with Safety Flip Guard & DRS Button
    make_box("Formula_PIT_Guard_Base", (-0.08, -0.014, 0.020), (0.022, 0.020, 0.025), mats["metal_brushed"], bevel=0.001)
    make_cylinder("Formula_PIT_Toggle_Stem", (-0.08, -0.024, 0.020), 0.004, 0.018, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=16)
    make_cylinder("Formula_DRS_Button", (0.08, -0.014, 0.020), 0.010, 0.012, (math.radians(90), 0, 0), mats["ambient_iceblue"], vertices=20, bevel=0.001)

    # Additional Tactile Pushbuttons
    for pb_name, bx, bz, b_mat in [
        ("Radio", -0.08, -0.01, mats["ambient_green"]),
        ("Neutral", -0.08, -0.035, mats["wood_pianoblack"]),
        ("Flash", 0.08, -0.01, mats["chrome_jewel"]),
        ("Drink", 0.08, -0.035, mats["ambient_iceblue"]),
    ]:
        make_cylinder(f"Formula_Btn_{pb_name}", (bx, -0.014, bz), 0.008, 0.010, (math.radians(90), 0, 0), b_mat, vertices=20, bevel=0.001)

    # 8. Rear Carbon Shift Paddles with Hall-Effect Magnets & Dual Lower Analog Clutch Paddles
    make_steering_thumb_encoders_and_magnetic_paddles("Formula_Motorsport_Controls", (0.0, 0.0, 0.0), yoke_w=yoke_w, yoke_h=yoke_h, mats=mats, stripe_color="yellow")
    make_hex_bolt("Formula_Paddle_Bolt_L", (-0.095, 0.024, 0.02), 0.004, 0.016, (0, 0, 0), mats["titanium_finish"])
    make_hex_bolt("Formula_Paddle_Bolt_R", (0.095, 0.024, 0.02), 0.004, 0.016, (0, 0, 0), mats["titanium_finish"])
    make_paddle_micro_switch("Formula_Paddle_Switch_L", (-0.085, 0.022, 0.02), (0.010, 0.014, 0.016), mats)
    make_paddle_micro_switch("Formula_Paddle_Switch_R", (0.085, 0.022, 0.02), (0.010, 0.014, 0.016), mats)
    make_box("Formula_Clutch_Bite_L", (-0.09, 0.026, -0.05), (0.028, 0.006, 0.06), mats["metal_brushed"], bevel=0.002)
    make_box("Formula_Clutch_Bite_R", (0.09, 0.026, -0.05), (0.028, 0.006, 0.06), mats["metal_brushed"], bevel=0.002)

    # v13.0 Ultimate Craftsmanship Additions
    make_steering_column_telescopic_shroud("Formula_Telescopic_Shroud", (0.0, 0.08, 0.0), mats=mats)

    # v14.0 Ultimate Additions
    make_steering_column_quick_release_spline_hub("Steer_Formula_Quick_Release", (0.0, 0.04, 0.0), mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 4. DETAILED SEATS BUILDER
# ==============================================================================
def build_executive_seat(output_path):
    print(f"\n[BUILD] Engineering Executive Multi-Contour Seat (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Sculpted Bottom Cushion with Extendable Thigh Support, Pelvic Bolsters & Tuck-and-Roll Fluting
    make_box("Seat_Base_Center_Cushion", (0.0, 0.05, 0.32), (0.42, 0.44, 0.14), mats["leather_ebony"], bevel=0.018)
    make_motorized_thigh_extension_bolster("Seat_Thigh_Extension", (0.0, 0.28, 0.325), width=0.42, depth=0.13, height=0.13, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_ebony")
    make_box("Seat_Base_Bolster_L", (-0.23, 0.08, 0.36), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.018)
    make_box("Seat_Base_Bolster_R", (0.23, 0.08, 0.36), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.018)
    make_box("Seat_Base_Perforated_Insert", (0.0, 0.05, 0.392), (0.34, 0.40, 0.006), mats["leather_perforated"], bevel=0.002)
    # 4 horizontal ventilation flutes across seat base
    for flute_i in range(4):
        make_box(f"Seat_Base_Flute_Ridge_{flute_i+1}", (0.0, -0.08 + flute_i * 0.08, 0.396), (0.30, 0.025, 0.006), mats["leather_ebony"], bevel=0.002)

    # 1b. Deployable Ottoman Calf Rest with Motorized Telescoping Chrome Arms
    make_box("Seat_Deployable_Ottoman_Cushion", (0.0, 0.38, 0.24), (0.38, 0.14, 0.08), mats["leather_cognac"], bevel=0.014)
    make_cylinder("Seat_Ottoman_Telescope_Arm_L", (-0.12, 0.32, 0.22), 0.008, 0.14, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("Seat_Ottoman_Telescope_Arm_R", (0.12, 0.32, 0.22), 0.008, 0.14, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)

    # Bolster Accent Contrast Piping
    make_box("Seat_Bolster_Piping_L", (-0.19, 0.08, 0.395), (0.006, 0.46, 0.006), mats["piping_cognac"], bevel=0)
    make_box("Seat_Bolster_Piping_R", (0.19, 0.08, 0.395), (0.006, 0.46, 0.006), mats["piping_cognac"], bevel=0)

    # 2. Ergonomic Multi-Contour Backrest with Deep Torso Wings & Lumbar Flutes
    make_box("Seat_Backrest_Center_Pad", (0.0, -0.16, 0.72), (0.40, 0.12, 0.64), mats["leather_ebony"], bevel=0.020)
    make_box("Seat_Backrest_Wing_L", (-0.23, -0.14, 0.72), (0.08, 0.16, 0.62), mats["leather_cognac"], bevel=0.018)
    make_box("Seat_Backrest_Wing_R", (0.23, -0.14, 0.72), (0.08, 0.16, 0.62), mats["leather_cognac"], bevel=0.018)
    make_box("Seat_Backrest_Perforated_Insert", (0.0, -0.098, 0.72), (0.32, 0.006, 0.56), mats["leather_perforated"], bevel=0.002)
    for flute_b in range(5):
        make_box(f"Seat_Backrest_Flute_{flute_b+1}", (0.0, -0.093, 0.52 + flute_b * 0.09), (0.28, 0.006, 0.035), mats["leather_ebony"], bevel=0.002)

    # 3. Adjustable Headrest on Notched Chrome Posts with Plush Memory Foam Pillow & Surround Speakers
    make_box("Seat_Headrest_Core", (0.0, -0.14, 1.08), (0.28, 0.10, 0.18), mats["leather_ebony"], bevel=0.016)
    make_box("Seat_Headrest_Memory_Foam_Pillow", (0.0, -0.08, 1.08), (0.24, 0.04, 0.14), mats["leather_cognac"], bevel=0.012)
    make_cylinder("Seat_Headrest_Chrome_Post_L", (-0.08, -0.14, 0.98), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=20)
    make_cylinder("Seat_Headrest_Chrome_Post_R", (0.08, -0.14, 0.98), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=20)
    for n_i in range(3):
        make_cylinder(f"Seat_Headrest_Notch_L_{n_i+1}", (-0.08, -0.14, 0.94 + n_i * 0.02), 0.009, 0.003, (0, 0, 0), mats["titanium_finish"], vertices=16)
        make_cylinder(f"Seat_Headrest_Notch_R_{n_i+1}", (0.08, -0.14, 0.94 + n_i * 0.02), 0.009, 0.003, (0, 0, 0), mats["titanium_finish"], vertices=16)
    make_cylinder("Seat_Headrest_Speaker_L", (-0.13, -0.09, 1.08), 0.018, 0.006, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Seat_Headrest_Speaker_R", (0.13, -0.09, 1.08), 0.018, 0.006, (0, math.radians(-90), 0), mats["metal_brushed"], vertices=24)
    make_headrest_crest_medallion("Seat_Exec_Headrest_Medallion", (0.0, -0.058, 1.08), (math.radians(90), 0, 0), mats, finish="gold")

    # 4. 22-Way Power Seat Switchpack on Outer Cushion Valance with Tactile Silhouette Controls
    valance_x = -0.28
    make_seat_adjustment_switchpack("Seat_Exec_Silhouette_Switchpack", (valance_x, 0.06, 0.28), mats=mats, finish="chrome")
    make_knurled_cylinder("Seat_4Way_Lumbar_Knob", (valance_x - 0.012, 0.14, 0.27), 0.014, 0.010, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=20)

    # 5. Inboard Stalk-Mounted Seatbelt Receiver Buckle with Red Release Button & 3-Point Webbing
    make_cylinder("Seat_Belt_Stalk_Stem", (0.26, -0.08, 0.22), 0.008, 0.18, (0, math.radians(-15), 0), mats["titanium_finish"], vertices=16)
    make_box("Seat_Belt_Buckle_Casing", (0.28, -0.08, 0.32), (0.035, 0.045, 0.075), mats["leather_ebony"], bevel=0.003)
    make_box("Seat_Belt_Red_Release_Btn", (0.28, -0.08, 0.36), (0.025, 0.035, 0.012), mats["seatbelt_red_button"], bevel=0.001)
    make_box("Seat_Belt_Latch_Tongue", (0.28, -0.08, 0.375), (0.022, 0.030, 0.004), mats["metal_brushed"])
    make_box("Seat_Belt_Webbing_Shoulder", (-0.16, -0.06, 0.78), (0.05, 0.006, 0.62), mats["seatbelt_webbing"], bevel=0.001)
    make_box("Seat_Belt_Webbing_Lap", (0.06, 0.02, 0.38), (0.38, 0.048, 0.006), mats["seatbelt_webbing"], bevel=0.001)

    # 5b. B-Pillar Seatbelt Height Adjuster Slider Track
    make_seatbelt_height_adjuster("Seat_BPillar_Belt_Adjuster", (-0.38, -0.22, 0.85), 0.22, mats, sign=-1)

    # 6. Heavy-Duty Aluminum Seat Mounting Rails & Floor Sliders with Grade 12.9 Hex Bolts
    for rail_x in [-0.18, 0.18]:
        make_box(f"Seat_Slider_Rail_{'L' if rail_x < 0 else 'R'}", (rail_x, 0.04, 0.21), (0.04, 0.58, 0.035), mats["metal_brushed"], bevel=0.003)
        make_box(f"Seat_Floor_Mount_Foot_F_{'L' if rail_x < 0 else 'R'}", (rail_x, 0.30, 0.19), (0.06, 0.05, 0.02), mats["titanium_finish"], bevel=0.002)
        make_hex_bolt(f"Seat_Mount_Bolt_F_{'L' if rail_x < 0 else 'R'}", (rail_x, 0.30, 0.205), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])
        make_box(f"Seat_Floor_Mount_Foot_R_{'L' if rail_x < 0 else 'R'}", (rail_x, -0.22, 0.19), (0.06, 0.05, 0.02), mats["titanium_finish"], bevel=0.002)
        make_hex_bolt(f"Seat_Mount_Bolt_R_{'L' if rail_x < 0 else 'R'}", (rail_x, -0.22, 0.205), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])

    # 6b. Front Manual Slide Adjustment Grab-Bar (Bent Chrome Steel Towel Rail)
    make_cylinder("Seat_Slide_Bar_Front_Loop", (0.0, 0.33, 0.16), 0.006, 0.32, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=20)
    make_cylinder("Seat_Slide_Bar_Arm_L", (-0.16, 0.25, 0.17), 0.006, 0.16, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("Seat_Slide_Bar_Arm_R", (0.16, 0.25, 0.17), 0.006, 0.16, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)

    # 6c. ISOFIX Child Seat Anchor Flaps with Steel Loops & Wiring Conduit
    for isx in [-0.14, 0.14]:
        make_isofix_anchor_flap(f"Seat_ISOFIX_Flap_{'L' if isx < 0 else 'R'}", (isx, -0.12, 0.385), (0.038, 0.016, 0.024), mats)
    make_cylinder("Seat_Buckle_Wiring_Conduit", (0.24, -0.04, 0.20), 0.004, 0.18, (math.radians(20), 0, 0), mats["rubber_traction"], vertices=12)

    # 7. Seatback Magazine Map Pocket, Damped Coat Hanger Hook & Ambient Wash LED
    make_box("Seat_Rear_Magazine_Pocket", (0.0, -0.225, 0.65), (0.34, 0.015, 0.28), mats["leather_ebony"], bevel=0.004)
    make_box("Seat_Rear_Coat_Hanger_Hook", (0.0, -0.23, 0.95), (0.06, 0.02, 0.02), mats["chrome_jewel"], bevel=0.002)
    make_cylinder("Seat_Rear_Coat_Hook_Hinge", (0.0, -0.235, 0.95), 0.004, 0.025, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=14)
    make_box("Seat_Rear_Ambient_Wash_LED", (0.0, -0.23, 0.85), (0.28, 0.008, 0.006), mats["ambient_iceblue"], bevel=0)

    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent("Seat_Executive_3DKnit_Cushion", (0.0, 0.05, 0.395), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="anodized_petrol_blue")
    make_b_pillar_seatbelt_height_adjuster("Seat_Executive_BPillar_Adjuster_v13", (-0.38, -0.22, 0.85), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_pneumatic_lumbar_air_harness("Seat_Exec_Lumbar_Harness", (0.0, -0.16, 0.65), mats=mats)
    make_ottoman_calf_rest_and_footrest_assembly("Seat_Exec_Ottoman_Calf_Rest", (0.0, 0.38, 0.22), mats=mats)

    export_active_scene_to_glb(output_path)

def build_race_carbon_seat(output_path):
    print(f"\n[BUILD] Engineering GT3 Carbon Monocoque Bucket Seat (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Exposed 3K Twill High-Gloss Carbon Fiber Monocoque Shell
    make_box("Seat_Carbon_Monocoque_Shell", (0.0, -0.06, 0.68), (0.48, 0.52, 0.88), mats["carbon_twill"], bevel=0.016)

    # 1b. Carbon Weave Side Gusset Reinforcement Plates with Grade 12.9 Hardware
    for g_side, gx in [("L", -0.245), ("R", 0.245)]:
        make_box(f"Seat_Carbon_Side_Gusset_{g_side}", (gx, -0.08, 0.48), (0.012, 0.28, 0.22), mats["carbon_twill"], bevel=0.004)
        make_hex_bolt(f"Seat_Gusset_Bolt_Top_{g_side}", (gx, -0.08, 0.56), 0.005, 0.016, (0, math.radians(90), 0), mats["titanium_finish"])
        make_hex_bolt(f"Seat_Gusset_Bolt_Bot_{g_side}", (gx, -0.08, 0.40), 0.005, 0.016, (0, math.radians(90), 0), mats["titanium_finish"])

    # 2. Ergonomic Alcantara Cushion Pads
    make_box("Seat_Race_Base_Pad", (0.0, 0.06, 0.30), (0.38, 0.40, 0.06), mats["alcantara_charcoal"], bevel=0.010)
    make_box("Seat_Race_Lumbar_Pad", (0.0, -0.12, 0.52), (0.36, 0.05, 0.22), mats["alcantara_charcoal"], bevel=0.010)
    make_box("Seat_Race_Thorax_Pad", (0.0, -0.14, 0.78), (0.34, 0.05, 0.22), mats["alcantara_charcoal"], bevel=0.010)
    make_box("Seat_Race_Head_Rest_Pad", (0.0, -0.12, 1.05), (0.26, 0.05, 0.16), mats["alcantara_charcoal"], bevel=0.010)

    # 2b. 5th & 6th Point Anti-Submarining Crotch Pass-Through Grommet in Seat Base
    make_box("Seat_Race_AntiSub_Grommet", (0.0, 0.02, 0.285), (0.08, 0.05, 0.02), mats["metal_brushed"], bevel=0.002)
    make_box("Seat_Race_AntiSub_Strap_L", (-0.025, 0.02, 0.32), (0.025, 0.045, 0.08), mats["harness_red"], bevel=0.001)
    make_box("Seat_Race_AntiSub_Strap_R", (0.025, 0.02, 0.32), (0.025, 0.045, 0.08), mats["harness_red"], bevel=0.001)

    # 3. Anodized Aluminum Shoulder Harness Pass-Through Bezel Grommets
    for g_side, gx in [("L", -0.09), ("R", 0.09)]:
        make_box(f"Seat_Harness_Grommet_{g_side}", (gx, -0.15, 0.94), (0.06, 0.02, 0.04), mats["metal_brushed"], bevel=0.002)

    # 4. Concours v12.0 FIA 6-Point Competition Racing Harness System with Quick-Adjusters & Rotary Camlock
    make_racing_harness_system("Seat_Race_Harness", (0.0, -0.06, 0.0), mats=mats, color="red")

    # 5. Stamped Steel Side Mounting Brackets with Multi-Hole Tilt Adjustments & Grade 12.9 Hex Bolts
    for b_side, bx in [("L", -0.25), ("R", 0.25)]:
        make_box(f"Seat_Side_Mount_Bracket_{b_side}", (bx, 0.02, 0.25), (0.015, 0.44, 0.12), mats["titanium_finish"], bevel=0.002)
        for hi, hy in enumerate([-0.12, 0.02, 0.16]):
            make_hex_bolt(f"Seat_Side_Bolt_{b_side}_{hi+1}", (bx, hy, 0.27), 0.006, 0.022, (0, math.radians(90), 0), mats["chrome_jewel"])

    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent("Seat_Race_3DKnit_Cushion", (0.0, 0.06, 0.335), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_red")

    # v14.0 Ultimate Additions
    make_pneumatic_lumbar_air_harness("Seat_Race_Lumbar_Harness", (0.0, -0.12, 0.55), mats=mats)

    export_active_scene_to_glb(output_path)

def build_sport_bucket_seat(output_path):
    print(f"\n[BUILD] Engineering Sport Adaptive Bucket Seat (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Sculpted Alcantara Cushion with Flutes and Bolster Contours
    make_box("Seat_Sport_Center_Cushion", (0.0, 0.02, 0.30), (0.38, 0.38, 0.12), mats["alcantara_charcoal"], bevel=0.014)
    make_motorized_thigh_extension_bolster("Seat_Sport_Thigh_Extension", (0.0, 0.26, 0.30), width=0.38, depth=0.12, height=0.11, rot_euler=(0, 0, 0), mats=mats, leather_mat="alcantara_charcoal")
    make_box("Seat_Sport_Thigh_Bolster_L", (-0.22, 0.08, 0.36), (0.09, 0.46, 0.19), mats["leather_ebony"], bevel=0.016)
    make_box("Seat_Sport_Thigh_Bolster_R", (0.22, 0.08, 0.36), (0.09, 0.46, 0.19), mats["leather_ebony"], bevel=0.016)

    # 4 horizontal ventilation flutes on center cushion
    for flute_i in range(4):
        make_box(f"Seat_Sport_Cushion_Flute_{flute_i+1}", (0.0, -0.06 + flute_i * 0.08, 0.362), (0.28, 0.022, 0.006), mats["leather_perforated"], bevel=0.001)

    # Bolster Accent Contrast Piping
    make_box("Seat_Sport_Piping_L", (-0.18, 0.08, 0.395), (0.006, 0.44, 0.006), mats["piping_cognac"], bevel=0)
    make_box("Seat_Sport_Piping_R", (0.18, 0.08, 0.395), (0.006, 0.44, 0.006), mats["piping_cognac"], bevel=0)

    # ISOFIX Child Seat Safety Anchor Flaps in Seat Bight
    make_isofix_anchor_flap("Seat_Sport_ISOFIX_L", (-0.14, -0.09, 0.32), (0.045, 0.035, 0.025), mats)
    make_isofix_anchor_flap("Seat_Sport_ISOFIX_R", (0.14, -0.09, 0.32), (0.045, 0.035, 0.025), mats)

    # 2. Sculpted Backrest with Deep Shoulder Wings & Carbon Seatback Shell
    make_box("Seat_Sport_Backrest_Core", (0.0, -0.15, 0.70), (0.38, 0.12, 0.62), mats["alcantara_charcoal"], bevel=0.016)
    make_box("Seat_Sport_Torso_Wing_L", (-0.22, -0.12, 0.70), (0.09, 0.18, 0.58), mats["leather_ebony"], bevel=0.016)
    make_box("Seat_Sport_Torso_Wing_R", (0.22, -0.12, 0.70), (0.09, 0.18, 0.58), mats["leather_ebony"], bevel=0.016)
    make_box("Seat_Sport_Rear_Carbon_Shell", (0.0, -0.22, 0.70), (0.42, 0.04, 0.64), mats["carbon_twill"], bevel=0.018)

    # 3. Integrated Racing Headrest with Anodized Harness Pass-Through Grommets
    make_box("Seat_Sport_Integrated_Headrest", (0.0, -0.14, 1.06), (0.26, 0.10, 0.18), mats["leather_ebony"], bevel=0.014)
    make_box("Seat_Sport_Harness_Pass_L", (-0.08, -0.14, 0.94), (0.05, 0.02, 0.035), mats["metal_brushed"], bevel=0.002)
    make_box("Seat_Sport_Harness_Pass_R", (0.08, -0.14, 0.94), (0.05, 0.02, 0.035), mats["metal_brushed"], bevel=0.002)
    make_headrest_crest_medallion("Seat_Sport_Medallion", (0.0, -0.09, 1.06), (math.radians(90), 0, 0), mats, finish="gold")

    # 4. Manual Pneumatic Lumbar Squeeze Bulb & Bleed Valve on Flexible Hose
    make_cylinder("Seat_Sport_Lumbar_Bulb", (-0.26, 0.18, 0.28), 0.018, 0.05, (math.radians(45), 0, 0), mats["rubber_traction"], vertices=20, bevel=0.006)
    make_knurled_cylinder("Seat_Sport_Lumbar_Valve", (-0.28, 0.20, 0.31), 0.007, 0.012, (math.radians(45), 0, 0), mats["metal_brushed"], ridges=14)
    make_cylinder("Seat_Sport_Lumbar_Hose", (-0.24, 0.14, 0.26), 0.003, 0.14, (math.radians(30), 0, 0), mats["rubber_traction"], vertices=12)

    # 5. 8-Way Power Seat Switchpack on Outer Cushion Valance
    valance_x = -0.27
    make_box("Seat_Sport_Switch_Bezel", (valance_x, 0.06, 0.27), (0.02, 0.16, 0.05), mats["wood_pianoblack"], bevel=0.002)
    make_pill_cylinder("Seat_Sport_Slider_Rocker", (valance_x - 0.012, 0.02, 0.27), 0.006, 0.055, (math.radians(90), 0, 0), mats["metal_brushed"])
    make_pill_cylinder("Seat_Sport_Recline_Rocker", (valance_x - 0.012, 0.09, 0.285), 0.006, 0.040, (0, 0, 0), mats["metal_brushed"])

    # 6. Competition FIA 6-Point Racing Harness System
    make_racing_harness_system("Seat_Sport_Harness", (0.0, -0.06, 0.0), mats=mats, color="red")

    # 7. Heavy-Duty Aluminum Rails with Grade 12.9 Floor Hex Bolts & Manual Slide Towel Rail
    for rx in [-0.18, 0.18]:
        make_box(f"Seat_Sport_Rail_{'L' if rx < 0 else 'R'}", (rx, 0.04, 0.20), (0.04, 0.56, 0.03), mats["titanium_finish"], bevel=0.003)
        make_hex_bolt(f"Seat_Sport_Rail_Bolt_F_{'L' if rx < 0 else 'R'}", (rx, 0.28, 0.22), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])
        make_hex_bolt(f"Seat_Sport_Rail_Bolt_R_{'L' if rx < 0 else 'R'}", (rx, -0.20, 0.22), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])

    make_cylinder("Seat_Sport_Slide_Bar_Loop", (0.0, 0.32, 0.16), 0.006, 0.30, (0, math.radians(90), 0), mats["metal_brushed"], vertices=20)
    make_cylinder("Seat_Sport_Slide_Bar_Arm_L", (-0.15, 0.24, 0.17), 0.006, 0.15, (math.radians(45), 0, 0), mats["metal_brushed"], vertices=16)
    make_cylinder("Seat_Sport_Slide_Bar_Arm_R", (0.15, 0.24, 0.17), 0.006, 0.15, (math.radians(45), 0, 0), mats["metal_brushed"], vertices=16)

    # 8. Rear Storage Pocket Net & Coat Hook
    make_box("Seat_Sport_Rear_Pocket", (0.0, -0.225, 0.64), (0.34, 0.015, 0.26), mats["leather_ebony"], bevel=0.004)
    make_box("Seat_Sport_Coat_Hook", (0.0, -0.23, 0.94), (0.05, 0.018, 0.018), mats["metal_brushed"], bevel=0.002)

    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent("Seat_Sport_3DKnit_Cushion", (0.0, 0.02, 0.365), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_petrol_blue")

    # v14.0 Ultimate Additions
    make_pneumatic_lumbar_air_harness("Seat_Sport_Lumbar_Harness", (0.0, -0.12, 0.55), mats=mats)

    export_active_scene_to_glb(output_path)

def build_luxury_massage_seat(output_path):
    print(f"\n[BUILD] Engineering Luxury Multi-Contour Massage Seat (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Sculpted Cushion with Diamond-Quilted Leather Inserts & Extendable Thigh Support
    make_box("Seat_Massage_Base_Cushion", (0.0, 0.05, 0.32), (0.44, 0.46, 0.14), mats["leather_cognac"], bevel=0.018)
    make_motorized_thigh_extension_bolster("Seat_Massage_Thigh_Extension", (0.0, 0.29, 0.325), width=0.42, depth=0.13, height=0.13, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_cognac")
    make_box("Seat_Massage_Base_Bolster_L", (-0.23, 0.08, 0.36), (0.08, 0.48, 0.18), mats["leather_ebony"], bevel=0.018)
    make_box("Seat_Massage_Base_Bolster_R", (0.23, 0.08, 0.36), (0.08, 0.48, 0.18), mats["leather_ebony"], bevel=0.018)
    make_box("Seat_Massage_Base_Quilt_Pad", (0.0, 0.06, 0.392), (0.34, 0.40, 0.006), mats["leather_perforated"], bevel=0.002)

    # 1b. Deployable Ottoman Leg Rest with Diamond Quilting & Telescoping Arms
    make_box("Seat_Massage_Ottoman_Cushion", (0.0, 0.40, 0.24), (0.40, 0.14, 0.08), mats["leather_cognac"], bevel=0.014)
    make_cylinder("Seat_Massage_Ottoman_Arm_L", (-0.12, 0.34, 0.22), 0.008, 0.14, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("Seat_Massage_Ottoman_Arm_R", (0.12, 0.34, 0.22), 0.008, 0.14, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)

    # 2. Backrest with Pneumatic Massage Chambers & Diamond-Quilted Center
    make_box("Seat_Massage_Backrest_Cushion", (0.0, -0.16, 0.72), (0.42, 0.13, 0.64), mats["leather_cognac"], bevel=0.020)
    make_box("Seat_Massage_Backrest_Wing_L", (-0.23, -0.14, 0.72), (0.08, 0.16, 0.62), mats["leather_ebony"], bevel=0.018)
    make_box("Seat_Massage_Backrest_Wing_R", (0.23, -0.14, 0.72), (0.08, 0.16, 0.62), mats["leather_ebony"], bevel=0.018)
    make_box("Seat_Massage_Diamond_Quilt_Pad", (0.0, -0.098, 0.72), (0.32, 0.006, 0.56), mats["leather_perforated"], bevel=0.002)
    for node_i in range(6):
        nz = 0.50 + node_i * 0.08
        make_box(f"Seat_Massage_Pneumatic_Cell_{node_i+1}", (0.0, -0.093, nz), (0.26, 0.006, 0.04), mats["leather_cognac"], bevel=0.002)

    # 3. Articulated Memory Foam Neck Roll Pillow with Embossed Crest & Notched Posts
    make_box("Seat_Massage_Headrest_Core", (0.0, -0.14, 1.08), (0.28, 0.10, 0.18), mats["leather_cognac"], bevel=0.016)
    make_cylinder("Seat_Massage_Neck_Pillow", (0.0, -0.07, 1.07), 0.045, 0.22, (0, math.radians(90), 0), mats["leather_ebony"], vertices=28, bevel=0.008)
    make_headrest_crest_medallion("Seat_Massage_Medallion", (0.0, -0.022, 1.07), (math.radians(90), 0, 0), mats, finish="gold")
    make_cylinder("Seat_Massage_Headrest_Post_L", (-0.08, -0.14, 0.98), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=20)
    make_cylinder("Seat_Massage_Headrest_Post_R", (0.08, -0.14, 0.98), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=20)
    for n_i in range(3):
        make_cylinder(f"Seat_Massage_Notch_L_{n_i+1}", (-0.08, -0.14, 0.94 + n_i * 0.02), 0.009, 0.003, (0, 0, 0), mats["titanium_finish"], vertices=16)
        make_cylinder(f"Seat_Massage_Notch_R_{n_i+1}", (0.08, -0.14, 0.94 + n_i * 0.02), 0.009, 0.003, (0, 0, 0), mats["titanium_finish"], vertices=16)

    # 4. Rear Seatback Fold-Down Business Tray Table with Pen Groove, Card Clip & Diamond-Knurled Latch
    make_box("Seat_Rear_Tray_Table_Housing", (0.0, -0.23, 0.68), (0.38, 0.022, 0.26), mats["wood_walnut"], bevel=0.004)
    make_box("Seat_Rear_Tray_Table_Alu_Inlay", (0.0, -0.242, 0.68), (0.34, 0.003, 0.22), mats["metal_brushed"], bevel=0.001)
    make_box("Seat_Tray_Pen_Groove", (0.0, -0.244, 0.72), (0.18, 0.008, 0.004), mats["chrome_jewel"], bevel=0.001)
    make_box("Seat_Tray_Card_Clip", (0.12, -0.245, 0.72), (0.025, 0.006, 0.012), mats["anodized_gold"], bevel=0.001)
    make_knurled_cylinder("Seat_Rear_Tray_Latch_Knob", (0.0, -0.245, 0.79), 0.008, 0.008, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=16)
    make_cylinder("Seat_Rear_Tray_Hinge_L", (-0.17, -0.23, 0.55), 0.006, 0.03, (0, 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("Seat_Rear_Tray_Hinge_R", (0.17, -0.23, 0.55), 0.006, 0.03, (0, 0, 0), mats["chrome_jewel"], vertices=16)
    make_hex_bolt("Seat_Rear_Tray_Bolt_L", (-0.17, -0.24, 0.55), 0.004, 0.012, (math.radians(90), 0, 0), mats["chrome_jewel"])
    make_hex_bolt("Seat_Rear_Tray_Bolt_R", (0.17, -0.24, 0.55), 0.004, 0.012, (math.radians(90), 0, 0), mats["chrome_jewel"])

    # 4b. Lower Elastic Magazine Mesh Net with Chrome Anchor Hooks
    make_box("Seat_Massage_Magazine_Net_Frame", (0.0, -0.232, 0.46), (0.36, 0.008, 0.20), mats["leather_cognac"], bevel=0.003)
    make_box("Seat_Massage_Netting_Mesh", (0.0, -0.234, 0.46), (0.34, 0.002, 0.18), mats["leather_perforated"], bevel=0)
    for hk_x in [-0.16, 0.16]:
        make_cylinder(f"Seat_Net_Hook_{'L' if hk_x < 0 else 'R'}", (hk_x, -0.236, 0.54), 0.004, 0.012, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)

    # 5. Rear Seat 11.6" Entertainment OLED Tablet Dock with Articulated Bracket
    make_box("Seat_Rear_Tablet_Dock", (0.0, -0.235, 0.88), (0.30, 0.016, 0.18), mats["wood_pianoblack"], bevel=0.003)
    make_box("Seat_Rear_Tablet_OLED_Screen", (0.0, -0.244, 0.88), (0.28, 0.004, 0.16), mats["screen_oled"], bevel=0.001)

    # 6. Pneumatic Massage & Silhouette Switchpack on Cushion Valance
    valance_x = -0.28
    make_seat_adjustment_switchpack("Seat_Massage_Silhouette_Switchpack", (valance_x, 0.06, 0.28), mats=mats, finish="chrome")
    make_pill_cylinder("Seat_Massage_Mode_Button", (valance_x - 0.012, 0.00, 0.28), 0.008, 0.038, (math.radians(90), 0, 0), mats["chrome_jewel"])
    make_knurled_cylinder("Seat_Massage_Intensity_Dial", (valance_x - 0.012, 0.08, 0.28), 0.014, 0.012, (0, math.radians(90), 0), mats["anodized_gold"], ridges=20)
    for mem_i, m_lbl in enumerate(["M", "1", "2", "3"]):
        make_box(f"Seat_Massage_Mem_Btn_{m_lbl}", (valance_x - 0.012, 0.13 + mem_i * 0.016, 0.28), (0.004, 0.012, 0.014), mats["metal_brushed"], bevel=0.001)

    # 6b. ISOFIX Child Seat Anchor Flaps
    for isx in [-0.14, 0.14]:
        make_isofix_anchor_flap(f"Seat_Massage_ISOFIX_{'L' if isx < 0 else 'R'}", (isx, -0.10, 0.395), (0.038, 0.016, 0.024), mats)

    # 7. Seatbelt Receiver, Stalk & Webbing
    make_cylinder("Seat_Belt_Stalk_Stem", (0.26, -0.08, 0.22), 0.008, 0.18, (0, math.radians(-15), 0), mats["titanium_finish"], vertices=16)
    make_box("Seat_Belt_Buckle_Casing", (0.28, -0.08, 0.32), (0.035, 0.045, 0.075), mats["leather_ebony"], bevel=0.003)
    make_box("Seat_Belt_Red_Release_Btn", (0.28, -0.08, 0.36), (0.025, 0.035, 0.012), mats["seatbelt_red_button"], bevel=0.001)
    make_box("Seat_Belt_Webbing_Shoulder", (-0.16, -0.06, 0.78), (0.05, 0.006, 0.62), mats["seatbelt_webbing"], bevel=0.001)

    # 7b. B-Pillar Seatbelt Height Adjuster Slider Track
    make_seatbelt_height_adjuster("Seat_Massage_BPillar_Adjuster", (-0.38, -0.22, 0.85), 0.22, mats, sign=-1)

    # 8. Floor Sliders & Mounting Feet with Grade 12.9 Hex Bolts
    for rx in [-0.18, 0.18]:
        make_box(f"Seat_Slider_Rail_{'L' if rx < 0 else 'R'}", (rx, 0.04, 0.21), (0.04, 0.58, 0.035), mats["metal_brushed"], bevel=0.003)
        make_hex_bolt(f"Seat_Massage_Rail_Bolt_F_{'L' if rx < 0 else 'R'}", (rx, 0.30, 0.22), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])
        make_hex_bolt(f"Seat_Massage_Rail_Bolt_R_{'L' if rx < 0 else 'R'}", (rx, -0.22, 0.22), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])

    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent("Seat_Massage_3DKnit_Cushion", (0.0, 0.06, 0.395), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")
    make_b_pillar_seatbelt_height_adjuster("Seat_Massage_BPillar_Adjuster_v13", (-0.38, -0.22, 0.85), mats=mats)

    # v14.0 Ultimate Additions
    make_pneumatic_lumbar_air_harness("Seat_Massage_Lumbar_Harness", (0.0, -0.16, 0.65), mats=mats)
    make_ottoman_calf_rest_and_footrest_assembly("Seat_Massage_Ottoman_Calf_Rest", (0.0, 0.38, 0.22), mats=mats)

    export_active_scene_to_glb(output_path)
# ==============================================================================
# 5. DETAILED PEDALS BUILDER
# ==============================================================================
def build_race_pedals(output_path):
    print(f"\n[BUILD] Engineering Competition Floor Pedal Box (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Adjustable Slotted Chassis Rail Frame & Floor Carrier with Grade 12.9 Hex Mounting Bolts
    make_box("Pedal_Chassis_Slotted_Frame", (0.0, 0.04, 0.015), (0.48, 0.38, 0.02), mats["titanium_finish"], bevel=0.003)
    # 6 Grade 12.9 hex bolts securing the floor frame to the monocoque
    for bx, by in [(-0.21, -0.12), (-0.21, 0.19), (0.0, -0.12), (0.0, 0.19), (0.21, -0.12), (0.21, 0.19)]:
        make_hex_bolt(f"Pedal_Floor_Bolt_{bx}_{by}", (bx, by, 0.026), 0.007, 0.005, (0, 0, 0), mats["titanium_finish"])

    # Dual CNC lightening and indexing slots
    for sx in [-0.10, 0.10]:
        make_box(f"Pedal_Chassis_Index_Slot_{'L' if sx < 0 else 'R'}", (sx, 0.04, 0.024), (0.014, 0.26, 0.004), mats["metal_brushed"], bevel=0)
        make_cylinder(f"Pedal_Rail_Lock_Pin_{'L' if sx < 0 else 'R'}", (sx, -0.06, 0.028), 0.007, 0.014, (0, 0, 0), mats["chrome_jewel"], vertices=16)

    # 2. 45-Degree Angled Stamped Aluminum Dead Pedal (Footrest) at X = -0.18
    make_dead_pedal_footrest("Pedal_DeadPedal", (-0.18, 0.0, 0.08), size=(0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)

    # 3. Forged Alloy Clutch Pedal at X = -0.07 with Helical Return Spring & Clutch Stop Bolt
    make_cylinder("Pedal_Clutch_Arm_Forged", (-0.07, 0.06, 0.16), 0.012, 0.22, (math.radians(-25), 0, 0), mats["titanium_finish"], vertices=20)
    make_box("Pedal_Clutch_Pad_Face", (-0.07, -0.02, 0.12), (0.06, 0.09, 0.022), mats["metal_brushed"], bevel=0.003)
    make_hex_bolt("Pedal_Clutch_Pivot_Bolt", (-0.07, 0.06, 0.24), 0.007, 0.032, (0, math.radians(90), 0), mats["chrome_jewel"])
    make_spring_coil("Pedal_Clutch_Return_Spring", (-0.07, 0.10, 0.18), 0.012, 0.006, 5, 0.002, (math.radians(-90), 0, 0), mats["metal_brushed"])
    for ry_i in [-0.025, 0.0, 0.025]:
        make_box(f"Pedal_Clutch_Rubber_Stud_{ry_i}", (-0.07, -0.032, 0.12 + ry_i), (0.04, 0.005, 0.014), mats["rubber_traction"], bevel=0.001)

    # Adjustable clutch stop bolt with lock nut
    make_cylinder("Pedal_Clutch_Stop_Bolt", (-0.07, 0.02, 0.06), 0.006, 0.035, (math.radians(45), 0, 0), mats["chrome_jewel"], vertices=16)
    make_hex_bolt("Pedal_Clutch_Stop_Locknut", (-0.07, 0.02, 0.06), 0.009, 0.008, (math.radians(45), 0, 0), mats["titanium_finish"])

    # 4. Forged Alloy Brake Pedal with Balance Bar Linkage at X = +0.03
    make_cylinder("Pedal_Brake_Arm_Forged", (0.03, 0.06, 0.16), 0.015, 0.22, (math.radians(-25), 0, 0), mats["titanium_finish"], vertices=24)
    make_box("Pedal_Brake_Pad_Face", (0.03, -0.02, 0.12), (0.085, 0.11, 0.025), mats["metal_brushed"], bevel=0.003)
    make_hex_bolt("Pedal_Brake_Pivot_Bolt", (0.03, 0.06, 0.24), 0.008, 0.040, (0, math.radians(90), 0), mats["chrome_jewel"])
    make_spring_coil("Pedal_Brake_Return_Spring", (0.03, 0.10, 0.18), 0.014, 0.007, 6, 0.0025, (math.radians(-90), 0, 0), mats["anodized_red"])
    for rx_i in [-0.025, 0.025]:
        for ry_i in [-0.03, 0.0, 0.03]:
            make_box(f"Pedal_Brake_Rubber_Stud_{rx_i}_{ry_i}", (0.03 + rx_i, -0.033, 0.12 + ry_i), (0.018, 0.006, 0.018), mats["rubber_traction"], bevel=0.001)

    # 5. Floor-Mounted Organ-Type Throttle / Accelerator Pedal with Heel Hinge & TPS Sensor
    make_box("Pedal_Gas_Floor_Pivot_Base", (0.14, -0.08, 0.02), (0.065, 0.05, 0.025), mats["titanium_finish"], bevel=0.002)
    make_box("Pedal_Gas_Organ_Paddle_Plate", (0.14, -0.02, 0.11), (0.055, 0.20, 0.022), mats["metal_brushed"], bevel=0.003)
    make_spring_coil("Pedal_Gas_Return_Spring", (0.14, -0.04, 0.05), 0.010, 0.005, 6, 0.0018, (math.radians(-35), 0, 0), mats["chrome_jewel"])
    for g_idx in [-0.016, 0.0, 0.016]:
        make_box(f"Pedal_Gas_Traction_Groove_{g_idx}", (0.14 + g_idx, -0.032, 0.11), (0.005, 0.18, 0.004), mats["rubber_traction"], bevel=0)

    # Throttle position sensor (TPS) potentiometer housing with wire loom and rubber boot
    make_box("Pedal_TPS_Housing", (0.18, -0.06, 0.04), (0.025, 0.035, 0.025), mats["wood_pianoblack"], bevel=0.002)
    make_cylinder("Pedal_TPS_Rubber_Boot", (0.18, -0.02, 0.04), 0.008, 0.020, (math.radians(90), 0, 0), mats["rubber_traction"], vertices=16)
    make_cylinder("Pedal_TPS_Wire_Loom", (0.18, -0.08, 0.04), 0.004, 0.06, (0, math.radians(90), 0), mats["rubber_traction"], vertices=12)

    # 6. Master Cylinder Pushrod Linkages with Dust Bellows, Bulkhead Mount & Knurled Bias Dial
    make_pedal_pushrod_linkage("Pedal_Pushrod_Brake", (0.03, 0.08, 0.22), mats=mats)
    make_pedal_pushrod_linkage("Pedal_Pushrod_Clutch", (-0.07, 0.08, 0.22), mats=mats)
    make_box("Pedal_Bulkhead_Mount_Chassis", (0.0, 0.14, 0.15), (0.44, 0.025, 0.28), mats["titanium_finish"], bevel=0.004)
    make_cylinder("Pedal_Master_Cylinder_Brake", (0.03, 0.20, 0.22), 0.018, 0.12, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Pedal_Master_Cylinder_Clutch", (-0.07, 0.20, 0.22), 0.018, 0.12, (math.radians(90), 0, 0), mats["metal_brushed"], vertices=24)
    make_an_fitting("Pedal_AN_Fitting_Brake", (0.03, 0.26, 0.22), 0.008, 0.024, (math.radians(90), 0, 0), mats["an_fitting_blue"], mats["anodized_red"], mats["braided_steel"])
    make_an_fitting("Pedal_AN_Fitting_Clutch", (-0.07, 0.26, 0.22), 0.008, 0.024, (math.radians(90), 0, 0), mats["an_fitting_blue"], mats["anodized_red"], mats["braided_steel"])
    make_cylinder("Pedal_Heim_Joint_Brake", (0.03, 0.14, 0.22), 0.010, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=20)
    make_cylinder("Pedal_Heim_Joint_Clutch", (-0.07, 0.14, 0.22), 0.010, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=20)
    make_knurled_cylinder("Pedal_Bias_Bar_Cable_Dial", (0.09, 0.14, 0.24), 0.014, 0.025, (0, 0, 0), mats["anodized_red"], ridges=20)
    make_cylinder("Pedal_Bias_Flex_Cable", (0.09, 0.08, 0.22), 0.005, 0.14, (math.radians(45), 0, 0), mats["metal_brushed"], vertices=12)

    # Laser etched balance bar calibration scale markings
    make_box("Pedal_Balance_Scale_Plate", (0.09, 0.14, 0.265), (0.024, 0.004, 0.018), mats["metal_brushed"], bevel=0.0005)
    for sc_i in range(5):
        make_box(f"Pedal_Balance_Scale_Tick_{sc_i+1}", (0.082 + sc_i * 0.004, 0.138, 0.265), (0.001, 0.002, 0.010), mats["anodized_red"])

    # 6b. Dual Brake & Clutch Hydraulic Pressure Sensor Transducers
    make_cylinder("Pedal_Brake_Pressure_Transducer", (0.03, 0.28, 0.24), 0.010, 0.028, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=16)
    make_cylinder("Pedal_Clutch_Pressure_Transducer", (-0.07, 0.28, 0.24), 0.010, 0.028, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=16)
    make_box("Pedal_Foot_Rest_Heel_Stop_Lip", (0.0, -0.14, 0.032), (0.46, 0.018, 0.024), mats["metal_brushed"], bevel=0.002)

    # 7. Triple Remote Firewall Billet Fluid Reservoirs with Translucent Sight Tubes & Diamond-Knurled Caps
    res_x_coords = [("Clutch", -0.10), ("Brake_Front", 0.0), ("Brake_Rear", 0.10)]
    for res_name, rx in res_x_coords:
        make_cylinder(f"Pedal_Fluid_Reservoir_{res_name}", (rx, 0.18, 0.33), 0.022, 0.075, (0, 0, 0), mats["billet_aluminum"], vertices=28, bevel=0.002)
        make_box(f"Pedal_Fluid_Sight_{res_name}", (rx, 0.16, 0.33), (0.012, 0.006, 0.045), mats["fluid_sight"], bevel=0.001)
        make_knurled_cylinder(f"Pedal_Fluid_Cap_{res_name}", (rx, 0.18, 0.375), 0.025, 0.014, (0, 0, 0), mats["anodized_red" if "Brake" in res_name else "metal_brushed"], ridges=24)
        make_cylinder(f"Pedal_Braided_Hose_{res_name}", (rx, 0.18, 0.28), 0.006, 0.04, (0, 0, 0), mats["metal_brushed"], vertices=16)

    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck("Pedal_Footwell_Nav_Gooseneck", (-0.24, -0.05, 0.15), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_motorsport_heel_rest_plate_and_footrest("Pedal_Race_Heel_Rest_System", (0.0, -0.12, 0.02), mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 6. DETAILED STARLIGHT ROOF BUILDER
# ==============================================================================
def build_starlight_roof(output_path):
    print(f"\n[BUILD] Engineering Fiber-Optic Starlight Roof (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    roof_w = 1.35
    roof_len = 1.85

    # 1. Molded Alcantara Headliner Shell
    make_box("Roof_Headliner_Alcantara_Shell", (0.0, 0.0, 0.02), (roof_w, roof_len, 0.035), mats["alcantara_charcoal"], bevel=0.014)

    # 2. Panoramic Dual-Pane Glass Framework & B-Pillar Structural Crossbeam
    make_box("Roof_Panoramic_Frame_Outer", (0.0, 0.0, 0.04), (roof_w * 1.02, roof_len * 1.02, 0.015), mats["metal_brushed"], bevel=0.004)
    make_box("Roof_B_Pillar_Crossbeam", (0.0, -0.05, 0.025), (roof_w * 0.98, 0.10, 0.03), mats["alcantara_charcoal"], bevel=0.008)
    make_cylinder("Roof_Blind_Cassette_Fwd", (0.0, 0.50, 0.01), 0.016, roof_w * 0.82, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Roof_Blind_Cassette_Rear", (0.0, -0.65, 0.01), 0.016, roof_w * 0.82, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)

    # 3. Front Overhead Console with SOS Emergency Module, Map Reading Lamps & Sunglasses Bin
    make_overhead_sos_console("Roof_Overhead_SOS_Module", (0.0, 0.68, -0.010), (0.24, 0.20, 0.030), mats)
    make_box("Roof_Waterfall_Ambient_Slit", (0.0, 0.58, -0.016), (0.18, 0.006, 0.004), mats["ambient_iceblue"], bevel=0)
    make_box("Roof_Sunroof_Slider_Switch", (0.0, 0.54, -0.016), (0.035, 0.04, 0.012), mats["metal_brushed"], bevel=0.002)
    make_box("Roof_Sunglasses_Bin_Door", (0.0, 0.46, -0.016), (0.16, 0.10, 0.015), mats["leather_ebony"], bevel=0.003)

    # Electrochromic panoramic glass opacity slider control switch
    make_box("Roof_Electrochromic_Tint_Slider_Bezel", (0.0, 0.56, -0.016), (0.08, 0.022, 0.008), mats["wood_pianoblack"], bevel=0.001)
    make_box("Roof_Electrochromic_Tint_Slider_Knob", (0.015, 0.56, -0.018), (0.012, 0.014, 0.006), mats["chrome_jewel"], bevel=0.0005)

    # 4. Dual Articulated Sunvisors with Lighted Vanity Mirrors
    make_box("Roof_Sunvisor_Driver_L", (-0.38, 0.74, -0.01), (0.34, 0.16, 0.018), mats["leather_ebony"], bevel=0.006)
    make_box("Roof_Sunvisor_Passenger_R", (0.38, 0.74, -0.01), (0.34, 0.16, 0.018), mats["leather_ebony"], bevel=0.006)
    make_cylinder("Roof_Sunvisor_Hinge_L", (-0.38, 0.81, 0.0), 0.006, 0.32, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
    make_cylinder("Roof_Sunvisor_Hinge_R", (0.38, 0.81, 0.0), 0.006, 0.32, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
    for v_side, vx in [("L", -0.38), ("R", 0.38)]:
        make_box(f"Roof_Sunvisor_Mirror_Frame_{v_side}", (vx, 0.74, -0.019), (0.16, 0.09, 0.004), mats["wood_pianoblack"], bevel=0.001)
        make_box(f"Roof_Sunvisor_Mirror_Glass_{v_side}", (vx, 0.74, -0.020), (0.13, 0.065, 0.002), mats["chrome_jewel"], bevel=0)
        make_box(f"Roof_Sunvisor_LED_Strip_L_{v_side}", (vx - 0.072, 0.74, -0.020), (0.004, 0.065, 0.003), mats["stitch_contrast"], bevel=0)
        make_box(f"Roof_Sunvisor_LED_Strip_R_{v_side}", (vx + 0.072, 0.74, -0.020), (0.004, 0.065, 0.003), mats["stitch_contrast"], bevel=0)

    # 4b. SOS Emergency Panel (Transparent Red Flip Cover & Status LEDs)
    make_box("Roof_SOS_Safety_Flip_Cover", (0.0, 0.74, -0.014), (0.044, 0.044, 0.006), mats["glass_clear"], bevel=0.001)
    make_cylinder("Roof_SOS_Status_LED_Green", (-0.028, 0.74, -0.016), 0.0025, 0.003, (0, 0, 0), mats["ambient_green"], vertices=12)
    make_cylinder("Roof_SOS_Status_LED_Red", (0.028, 0.74, -0.016), 0.0025, 0.003, (0, 0, 0), mats["anodized_red"], vertices=12)

    # 4c. Ultrasonic Cabin Alarm Sensor Grilles
    for mic_x in [-0.08, 0.08]:
        make_cylinder(f"Roof_Alarm_Sensor_Grille_{'L' if mic_x < 0 else 'R'}", (mic_x, 0.58, -0.016), 0.010, 0.003, (0, 0, 0), mats["metal_brushed"], vertices=20)

    # 5. Frameless Electrochromic Rearview Mirror with ADAS & Homelink
    make_frameless_electrochromic_mirror("Roof_Electrochromic_Mirror", (0.0, 0.82, -0.08), (0, 0, 0), mats)

    # 6. Four Spring-Damped Fold-Away Passenger Grab Handles
    grab_positions = [
        ("FL", -0.58, 0.42),
        ("FR", 0.58, 0.42),
        ("RL", -0.58, -0.42),
        ("RR", 0.58, -0.42)
    ]
    for pos_name, gx, gy in grab_positions:
        make_box(f"Roof_Grab_Handle_{pos_name}", (gx, gy, -0.012), (0.025, 0.18, 0.018), mats["leather_ebony"], bevel=0.004)
        for py_off in [-0.08, 0.08]:
            make_cylinder(f"Roof_Grab_Pivot_{pos_name}_{'F' if py_off < 0 else 'R'}", (gx, gy + py_off, 0.0), 0.006, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

    # 7. 64 Individual Fiber-Optic Constellation Stars & 3 Diagonal Shooting Star Meteor Tubes
    random.seed(42)
    for star_idx in range(64):
        sx = random.uniform(-roof_w * 0.42, roof_w * 0.42)
        sy = random.uniform(-roof_len * 0.42, 0.50)
        s_rad = random.uniform(0.0025, 0.0055)
        make_cylinder(f"Roof_Starlight_Fiber_{star_idx+1}", (sx, sy, -0.001), s_rad, 0.004, (0, 0, 0), mats["starlight_star"], vertices=12)

    meteor_streaks = [
        ((-0.35, 0.20, -0.002), (-0.15, -0.15, -0.002)),
        ((0.10, 0.40, -0.002), (0.35, 0.05, -0.002)),
        ((-0.20, -0.30, -0.002), (0.15, -0.65, -0.002)),
    ]
    for m_i, (m_start, m_end) in enumerate(meteor_streaks):
        mx = (m_start[0] + m_end[0]) / 2.0
        my = (m_start[1] + m_end[1]) / 2.0
        m_len = math.sqrt((m_end[0] - m_start[0])**2 + (m_end[1] - m_start[1])**2)
        make_box(f"Roof_Shooting_Star_Streak_{m_i+1}", (mx, my, -0.002), (m_len, 0.004, 0.003), mats["starlight_star"], bevel=0)

    # B-pillar upper seatbelt D-ring loop guides
    for b_side, bx in [("L", -roof_w * 0.48), ("R", roof_w * 0.48)]:
        make_seatbelt_height_adjuster(f"Roof_Belt_Adjuster_{b_side}", (bx, -0.05, -0.04), 0.20, mats, sign=(1 if b_side == 'R' else -1))

    # v14.0 Ultimate Additions
    make_smart_glass_roof_segments_and_grab_handles("Roof_SmartGlass_GrabHandles", (0.0, 0.0, 0.02), mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 7. DETAILED DOOR CARDS BUILDER
# ==============================================================================
def build_executive_door_cards(output_path):
    print(f"\n[BUILD] Engineering Executive Door Cards (v7.0 Class-A Master CAD L & R) -> {output_path}")
    mats = reset_scene_and_get_mats()

    door_w = 0.08
    door_len = 1.05
    door_h = 0.58

    for side, sign in [("L", -1), ("R", 1)]:
        dx = sign * 0.74

        # 1. Main Door Card Body with Sculpted Armrest Cavity
        make_box(f"Door_Main_Body_{side}", (dx, 0.0, 0.45), (door_w, door_len, door_h), mats["leather_ebony"], bevel=0.016)

        # 2. Upper Leather Waistline Rail with French Seam Stitching & Multi-Tier Lock Pin
        make_box(f"Door_Upper_Waistline_{side}", (dx, 0.0, 0.72), (door_w * 1.05, door_len * 0.98, 0.06), mats["leather_ebony"], bevel=0.008)
        make_box(f"Door_Waistline_Stitch_{side}", (dx - sign * 0.042, 0.0, 0.74), (0.004, door_len * 0.96, 0.004), mats["stitch_contrast"], bevel=0)
        make_cylinder(f"Door_Lock_Pin_Base_{side}", (dx - sign * 0.038, -0.42, 0.755), 0.005, 0.016, (0, 0, 0), mats["chrome_jewel"], vertices=16)
        make_cylinder(f"Door_Lock_Pin_Alert_Band_{side}", (dx - sign * 0.038, -0.42, 0.766), 0.0048, 0.005, (0, 0, 0), mats["anodized_red"], vertices=16)
        make_knurled_cylinder(f"Door_Lock_Pin_Knurled_Cap_{side}", (dx - sign * 0.038, -0.42, 0.772), 0.0055, 0.007, (0, 0, 0), mats["chrome_jewel"], ridges=16)

        # 2b. Upper Assist Grab Handle with Stitched Leather Strap & Chrome Hinges
        make_b_pillar_assist_handle(f"Door_Upper_Assist_{side}", (dx - sign * 0.040, 0.05, 0.82), length=0.18, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_cognac")

        # 3. Open-Pore Walnut Wood Spear with Integrated Ice-Blue Ambient Lightguide
        make_box(f"Door_Wood_Spear_{side}", (dx - sign * 0.038, 0.0, 0.65), (0.012, door_len * 0.92, 0.065), mats["wood_walnut"], bevel=0.004)
        make_box(f"Door_Ambient_Lightguide_{side}", (dx - sign * 0.045, 0.0, 0.615), (0.006, door_len * 0.90, 0.006), mats["ambient_iceblue"], bevel=0)

        # 4. Floating Padded Leather Armrest & Pull Handle with Heated Armrest Switch
        make_box(f"Door_Floating_Armrest_{side}", (dx - sign * 0.055, 0.05, 0.48), (0.07, 0.48, 0.06), mats["leather_cognac"], bevel=0.012)
        make_box(f"Door_Grab_Handle_Recess_{side}", (dx - sign * 0.045, 0.15, 0.49), (0.035, 0.12, 0.04), mats["wood_pianoblack"], bevel=0.002)
        make_box(f"Door_Heated_Armrest_Btn_{side}", (dx - sign * 0.055, 0.08, 0.515), (0.012, 0.016, 0.006), mats["anodized_red"], bevel=0.001)

        # Armrest structural titanium anchor hex bolts
        for ax_off in [-0.14, 0.20]:
            make_hex_bolt(f"Door_Armrest_Anchor_Bolt_{side}_{'F' if ax_off > 0 else 'R'}", (dx - sign * 0.048, 0.05 + ax_off, 0.445), 0.005, 0.004, (0, math.radians(90), 0), mats["titanium_finish"])

        # 5. Articulated Interior Door Release Lever, Lock Rocker & Seat Memory Module
        make_articulated_door_latch(f"Door_Latch_{side}", (dx - sign * 0.044, 0.30, 0.62), (0.11, 0.035, 0.055), mats=mats, side=side)
        make_seat_adjustment_switchpack(f"Door_Seat_Switchpack_{side}", (dx - sign * 0.044, 0.16, 0.62), mats=mats, finish="chrome")

        # 6. Burmester 3D Rotating Acoustic Tweeter Pod at Sail Panel
        make_burmester_acoustic_tweeter_orb(f"Door_Rotating_Tweeter_Pod_{side}", (dx - sign * 0.044, 0.45, 0.70), (0, math.radians(90 * sign), 0), mats, finish="chrome")

        # 7. Laser-Drilled Bespoke High-End Acoustic 3D Speaker Array & Woofer Grille
        make_high_end_acoustic_speaker_array(f"Door_HighEnd_Acoustic_{side}", (dx - sign * 0.042, 0.28, 0.32), radius=0.072, depth=0.018, rot_euler=(0, math.radians(90 * sign), 0), mats=mats, finish="chrome")
        make_speaker_acoustic_grille(f"Door_Woofer_Acoustic_{side}", (dx - sign * 0.042, 0.02, 0.24), 0.086, 0.014, (0, math.radians(90), 0), mats, rings=5)

        # 8. Master Power Window Switchpack with Tactile Pill Rockers & Knurled Mirror Joystick
        make_box(f"Door_Window_Switchpack_{side}", (dx - sign * 0.055, 0.22, 0.515), (0.035, 0.14, 0.018), mats["wood_pianoblack"], bevel=0.002)
        for sw_i in range(4):
            make_pill_cylinder(f"Door_Window_Pill_{side}_{sw_i+1}", (dx - sign * 0.058, 0.16 + sw_i * 0.028, 0.526), 0.0055, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"])
            make_cylinder(f"Door_Window_Pivot_{side}_{sw_i+1}", (dx - sign * 0.058, 0.16 + sw_i * 0.028, 0.526), 0.0018, 0.020, (0, math.radians(90), 0), mats["titanium_finish"], vertices=12)

        make_cylinder(f"Door_Mirror_Joystick_Stem_{side}", (dx - sign * 0.058, 0.27, 0.534), 0.006, 0.014, (0, 0, 0), mats["metal_brushed"], vertices=16)
        make_knurled_cylinder(f"Door_Mirror_Knurled_Collar_{side}", (dx - sign * 0.058, 0.27, 0.526), 0.010, 0.006, (0, 0, 0), mats["chrome_jewel"], ridges=20)

        # 9. Lower Map Pocket, Puddle Projector, Door Striker Pin & Safety Reflector
        make_box(f"Door_Lower_Map_Pocket_{side}", (dx - sign * 0.045, -0.15, 0.24), (0.05, 0.48, 0.16), mats["leather_ebony"], bevel=0.008)
        make_cylinder(f"Door_Puddle_Projector_Lens_{side}", (dx, -0.35, 0.17), 0.012, 0.008, (0, 0, 0), mats["ambient_iceblue"], vertices=20)
        make_cylinder(f"Door_Striker_Pin_{side}", (dx, -0.52, 0.48), 0.007, 0.025, (0, math.radians(90), 0), mats["titanium_finish"], vertices=16)
        make_box(f"Door_Safety_Reflector_{side}", (dx - sign * 0.040, -0.48, 0.20), (0.010, 0.065, 0.028), mats["door_reflector"], bevel=0.002)

        # Soft-close door latch striker housing with sensor
        make_box(f"Door_SoftClose_Latch_Housing_{side}", (dx, -0.52, 0.44), (0.035, 0.06, 0.06), mats["titanium_finish"], bevel=0.003)
        make_cylinder(f"Door_SoftClose_Motor_Sensor_{side}", (dx - sign * 0.015, -0.52, 0.44), 0.006, 0.010, (0, math.radians(90), 0), mats["ambient_iceblue"], vertices=16)

        # 10. Integrated Rolls-Royce Style Door Jamb Umbrella Channel with Chrome Push-Release Button
        make_cylinder(f"Door_Umbrella_Channel_{side}", (dx, 0.48, 0.38), 0.028, 0.04, (0, math.radians(90), 0), mats["titanium_finish"], vertices=24, bevel=0.002)
        make_cylinder(f"Door_Umbrella_Release_Btn_{side}", (dx + sign * 0.022, 0.48, 0.38), 0.014, 0.008, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=24)
        make_cylinder(f"Door_Puddle_Logo_Projector_{side}", (dx, 0.0, 0.17), 0.012, 0.006, (0, 0, 0), mats["ambient_iceblue"], vertices=20)

        # 11. Illuminated Door Sill Scuff Plate with Titanium Fasteners & Laser Script
        make_illuminated_door_sill_kickplate(f"Door_Sill_Kickplate_{side}", (dx, 0.0, 0.16), (0, 0, 0), mats, script_text="EXECUTIVE", carbon=False)

        # v13.0 Ultimate Craftsmanship Additions
        make_door_pocket_waterfall_ambient_guide(f"Door_Waterfall_Guide_{side}", (dx - sign * 0.045, -0.15, 0.28), length=0.34, mats=mats)
        make_b_pillar_seatbelt_height_adjuster(f"Door_BPillar_Adjuster_{side}", (dx - sign * 0.02, -0.40, 0.75), rot_euler=(0, 0, 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_sport_door_cards(output_path):
    print(f"\n[BUILD] Engineering Sport GT Door Cards (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    door_w = 0.075
    door_len = 1.02
    door_h = 0.56

    for side, sign in [("L", -1), ("R", 1)]:
        dx = sign * 0.74

        # 1. Main Alcantara Body
        make_box(f"Door_Sport_Body_{side}", (dx, 0.0, 0.45), (door_w, door_len, door_h), mats["alcantara_charcoal"], bevel=0.014)

        # 2. Forged Carbon Insert Spear & Amber Lightpipe
        make_box(f"Door_Sport_Carbon_Spear_{side}", (dx - sign * 0.036, 0.0, 0.64), (0.012, door_len * 0.90, 0.06), mats["carbon_forged"], bevel=0.004)
        make_box(f"Door_Sport_Amber_Lightpipe_{side}", (dx - sign * 0.042, 0.0, 0.605), (0.006, door_len * 0.88, 0.006), mats["ambient_amber"], bevel=0)

        # 3. Red Fabric Door Pull Strap with Billet Escutcheon, Hex Fastener & Anodized Pull Ring
        make_box(f"Door_Sport_Pull_Strap_Anchor_{side}", (dx - sign * 0.045, 0.25, 0.50), (0.02, 0.04, 0.02), mats["titanium_finish"], bevel=0.002)
        make_hex_bolt(f"Door_Sport_Pull_Strap_Hex_{side}", (dx - sign * 0.056, 0.25, 0.50), 0.006, 0.006, (0, math.radians(90), 0), mats["titanium_finish"])
        make_box(f"Door_Sport_Pull_Strap_{side}", (dx - sign * 0.052, 0.21, 0.47), (0.008, 0.12, 0.035), mats["harness_red"], bevel=0.002)
        make_torus(f"Door_Sport_Pull_Ring_{side}", (dx - sign * 0.052, 0.32, 0.60), 0.016, 0.0035, (0, math.radians(90), 0), mats["anodized_red"])
        make_articulated_door_latch(f"Door_Sport_Latch_{side}", (dx - sign * 0.042, 0.36, 0.62), (0.095, 0.032, 0.048), mats=mats, side=side, finish="titanium")

        # 4. Carbon Armrest, 3D Acoustic Speaker Array & Tweeter
        make_box(f"Door_Sport_Armrest_{side}", (dx - sign * 0.050, 0.0, 0.46), (0.06, 0.42, 0.05), mats["leather_ebony"], bevel=0.010)
        make_cylinder(f"Door_Sport_Tweeter_{side}", (dx - sign * 0.042, 0.42, 0.68), 0.028, 0.012, (0, math.radians(90), 0), mats["anodized_red"], vertices=28, bevel=0.002)
        make_high_end_acoustic_speaker_array(f"Door_Sport_Acoustic_Grille_{side}", (dx - sign * 0.040, 0.26, 0.28), radius=0.074, depth=0.018, rot_euler=(0, math.radians(90 * sign), 0), mats=mats, finish="titanium")

        # Diamond-knurled window/mirror selector knob
        make_knurled_cylinder(f"Door_Sport_Knurled_Selector_{side}", (dx - sign * 0.052, 0.12, 0.485), 0.012, 0.012, (0, 0, 0), mats["metal_brushed"], ridges=20)

        # 5. Elastic Mesh Map Pocket Net with Lightweight Frame
        make_box(f"Door_Sport_Mesh_Net_Frame_{side}", (dx - sign * 0.042, -0.12, 0.25), (0.015, 0.38, 0.15), mats["titanium_finish"], bevel=0.003)
        make_box(f"Door_Sport_Elastic_Mesh_{side}", (dx - sign * 0.044, -0.12, 0.25), (0.005, 0.36, 0.13), mats["leather_perforated"], bevel=0)

        # 6. Striker Pin & Safety Reflector
        make_cylinder(f"Door_Sport_Striker_Pin_{side}", (dx, -0.50, 0.46), 0.007, 0.025, (0, math.radians(90), 0), mats["titanium_finish"], vertices=16)
        make_box(f"Door_Sport_Safety_Reflector_{side}", (dx - sign * 0.038, -0.46, 0.20), (0.008, 0.060, 0.026), mats["door_reflector"], bevel=0.002)

        # 7. Illuminated Forged Carbon Door Sill Scuff Plate with Titanium Fasteners
        make_illuminated_door_sill_kickplate(f"Door_Sport_Sill_{side}", (dx, 0.0, 0.16), (0, 0, 0), mats, script_text="GT3 RS", carbon=True)

        # v13.0 Ultimate Craftsmanship Additions
        make_door_pocket_waterfall_ambient_guide(f"Door_Sport_Waterfall_Guide_{side}", (dx - sign * 0.042, -0.12, 0.28), length=0.30, mats=mats)

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 8. COMPLETE INTEGRATED COCKPITS BUILDER
# ==============================================================================
def build_complete_luxury_executive_cockpit(output_path):
    print(f"\n[BUILD] Engineering Complete Luxury Executive Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Monocoque Floor Tub & Tufted Carpet
    make_box("Cockpit_Floor_Carpet", (0.0, 0.10, 0.12), (1.52, 1.85, 0.04), mats["carpet_tufted"], bevel=0.008)

    # 2. Driver Heel Rest Plate & Ribs
    make_box("Cockpit_Heel_Rest_Plate", (-0.38, 0.40, 0.145), (0.34, 0.26, 0.008), mats["metal_brushed"], bevel=0.002)
    for h_rib in range(4):
        make_box(f"Cockpit_Heel_Rest_Rib_{h_rib+1}", (-0.38, 0.32 + h_rib * 0.05, 0.152), (0.30, 0.015, 0.005), mats["rubber_traction"], bevel=0.001)

    # 2b. Ergonomic Dead Pedal Footrest with CNC Milled Channels & Rubber Traction Ribs
    make_dead_pedal_footrest("Cockpit_Exec_Footrest", (-0.48, 0.54, 0.20), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)

    # 2c. Tailored Deep-Pile Carpet Floor Mats with French Cognac Leather Binding
    make_tailored_floor_mat("Cockpit_Exec_Mat_Driver", (-0.38, 0.18, 0.125), (0.44, 0.65, 0.010), mats=mats, leather_mat="leather_cognac")
    make_tailored_floor_mat("Cockpit_Exec_Mat_Passenger", (0.38, 0.18, 0.125), (0.44, 0.65, 0.010), mats=mats, leather_mat="leather_cognac")

    # 3. Executive Dashboard (Padded cowl, walnut spear, triple OLED displays, clock)
    make_box("Cockpit_Executive_Dash_Cowl", (0.0, 0.58, 0.76), (1.46, 0.52, 0.09), mats["leather_ebony"], bevel=0.014)
    make_box("Cockpit_Executive_Dash_Walnut", (0.0, 0.52, 0.72), (1.42, 0.04, 0.08), mats["wood_walnut"], bevel=0.006)
    make_box("Cockpit_Executive_Dash_Ambient", (0.0, 0.50, 0.68), (1.40, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)
    make_box("Cockpit_Executive_Cluster_OLED", (-0.38, 0.54, 0.78), (0.42, 0.015, 0.16), mats["screen_oled"], bevel=0.002)
    make_box("Cockpit_Executive_Center_Touchscreen", (0.06, 0.51, 0.75), (0.46, 0.018, 0.22), mats["screen_oled"], bevel=0.002)
    make_box("Cockpit_Executive_Passenger_OLED", (0.46, 0.52, 0.75), (0.38, 0.015, 0.14), mats["screen_passenger"], bevel=0.002)
    make_cylinder("Cockpit_Executive_Clock", (0.06, 0.56, 0.81), 0.035, 0.02, (math.radians(35), 0, 0), mats["chrome_jewel"], vertices=36, bevel=0.002)
    make_knurled_cylinder("Cockpit_Executive_Clock_Bezel", (0.06, 0.56, 0.815), 0.038, 0.010, (math.radians(35), 0, 0), mats["chrome_jewel"], ridges=32)

    # 3b. Anti-Glare HUD Optical Combiner Projection Unit
    make_hud_glass_projector("Cockpit_Executive_HUD", (-0.38, 0.60, 0.81), (0.22, 0.16, 0.05), mats)

    # 3c. Precision Turbine AC Vents (Quad cluster with illuminated halos)
    for cv_i, cv_x in enumerate([-0.62, -0.16, 0.24, 0.62]):
        make_precision_turbine_ac_vent(f"Cockpit_Executive_Turbine_Vent_{cv_i+1}", (cv_x, 0.51, 0.72), 0.034, depth=0.024, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=8, illuminated=True, bezel_mat=mats["chrome_satin"])

    # 3d. Motorized Rotating Burmester Acoustic Tweeter Orbs & Frameless Electrochromic Mirror
    make_burmester_acoustic_tweeter_orb("Cockpit_Exec_Tweeter_L", (-0.68, 0.50, 0.78), (0, math.radians(40), 0), mats, finish="chrome")
    make_burmester_acoustic_tweeter_orb("Cockpit_Exec_Tweeter_R", (0.68, 0.50, 0.78), (0, math.radians(-40), 0), mats, finish="chrome")
    make_frameless_electrochromic_mirror("Cockpit_Executive_Mirror", (0.0, 0.46, 0.98), (0, 0, 0), mats)

    # 4. Center Bridge Console with Jewel OLED Dial, Shifter, Pill Switches & Deployable Cupholders
    make_box("Cockpit_Executive_Center_Console", (0.0, 0.0, 0.26), (0.32, 1.15, 0.28), mats["leather_ebony"], bevel=0.014)
    make_box("Cockpit_Executive_Console_Wood_Inlay", (0.0, 0.0, 0.405), (0.28, 1.10, 0.015), mats["wood_walnut"], bevel=0.004)
    make_rotary_dial_with_oled("Cockpit_Executive_Rotary_Dial_OLED", (0.0, 0.0, 0.425), 0.042, 0.024, (0, 0, 0), mats)
    make_electronic_gear_shifter("Cockpit_Executive_Shifter", (0.0, 0.14, 0.41), (0.045, 0.075, 0.090), mats=mats, crystal=False)
    make_knurled_cylinder("Cockpit_Executive_Volume_Roller", (0.08, 0.08, 0.418), 0.014, 0.038, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=24)
    make_pill_cylinder("Cockpit_Executive_EPB_Rocker", (-0.08, 0.08, 0.420), 0.007, 0.028, (0, 0, 0), mats["wood_pianoblack"])
    make_box("Cockpit_Executive_Armrest_L", (-0.07, -0.32, 0.44), (0.13, 0.36, 0.05), mats["leather_ebony"], bevel=0.010)
    make_box("Cockpit_Executive_Armrest_R", (0.07, -0.32, 0.44), (0.13, 0.36, 0.05), mats["leather_ebony"], bevel=0.010)
    make_wireless_charging_pad("Cockpit_Executive_Qi_Pad", (0.0, 0.35, 0.405), (0.14, 0.14, 0.008), mats)
    make_thermoelectric_cup_holder("Cockpit_Exec_ThermoCupholders", (0.0, 0.22, 0.405), mats=mats, finish="chrome")
    make_fragrance_atomizer_flacon("Cockpit_Exec_Fragrance_Flacon", (-0.10, 0.30, 0.415), mats=mats)
    make_vip_airline_tray_table_and_bar("Cockpit_Exec_VIP_Bar_Tray", (0.0, -0.42, 0.42), mats=mats, wood_finish="walnut", extended=False)
    make_box("Cockpit_Rear_HVAC_Touchscreen", (0.0, -0.56, 0.38), (0.16, 0.012, 0.09), mats["screen_oled"], bevel=0.002)
    for rv_x in [-0.05, 0.05]:
        make_box(f"Cockpit_Rear_HVAC_Louver_{'L' if rv_x < 0 else 'R'}", (rv_x, -0.56, 0.30), (0.04, 0.012, 0.03), mats["chrome_jewel"], bevel=0.001)

    # 5. Driver & Passenger Multi-Contour Executive Lounge Seats with Tactile Switchgear
    for seat_name, sx in [("Driver", -0.38), ("Passenger", 0.38)]:
        make_box(f"Cockpit_{seat_name}_Seat_Cushion", (sx, 0.0, 0.30), (0.46, 0.40, 0.14), mats["leather_ebony"], bevel=0.016)
        make_motorized_thigh_extension_bolster(f"Cockpit_{seat_name}_Thigh_Ext", (sx, 0.24, 0.30), width=0.44, depth=0.12, height=0.12, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_ebony")
        make_box(f"Cockpit_{seat_name}_Seat_Bolster_L", (sx - 0.22, 0.04, 0.34), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.016)
        make_box(f"Cockpit_{seat_name}_Seat_Bolster_R", (sx + 0.22, 0.04, 0.34), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.016)
        make_box(f"Cockpit_{seat_name}_Seat_Backrest", (sx, -0.16, 0.70), (0.44, 0.14, 0.62), mats["leather_ebony"], bevel=0.018)
        make_box(f"Cockpit_{seat_name}_Headrest", (sx, -0.14, 1.06), (0.28, 0.10, 0.16), mats["leather_ebony"], bevel=0.014)
        make_box(f"Cockpit_{seat_name}_Pillow", (sx, -0.09, 1.06), (0.24, 0.04, 0.12), mats["leather_cognac"], bevel=0.010)
        make_headrest_crest_medallion(f"Cockpit_{seat_name}_Headrest_Medallion", (sx, -0.065, 1.06), (math.radians(90), 0, 0), mats, finish="gold")
        
        # Micro-engineering seat adjustment controls on outer valance
        out_sign = -1 if sx < 0 else 1
        valance_x = sx + out_sign * 0.245
        make_seat_adjustment_switchpack(f"Cockpit_{seat_name}_Silhouette_Switchpack", (valance_x, 0.06, 0.28), mats=mats, finish="chrome")
        make_pill_cylinder(f"Cockpit_{seat_name}_Recline_Rocker", (valance_x, 0.08, 0.26), 0.0055, 0.024, (0, math.radians(90), 0), mats["metal_brushed"])
        make_knurled_cylinder(f"Cockpit_{seat_name}_Lumbar_Dial", (valance_x, 0.0, 0.26), 0.011, 0.012, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)
        
        # Floor mounting Grade 12.9 hex bolts
        for fx in [-0.18, 0.18]:
            for fy in [-0.18, 0.22]:
                make_hex_bolt(f"Cockpit_{seat_name}_RailBolt_{fx}_{fy}", (sx + fx, fy, 0.145), 0.006, 0.005, (0, 0, 0), mats["titanium_finish"])

        buckle_x = sx + (0.26 if sx < 0 else -0.26)
        make_box(f"Cockpit_{seat_name}_Buckle", (buckle_x, -0.06, 0.32), (0.035, 0.045, 0.075), mats["leather_ebony"], bevel=0.003)
        make_box(f"Cockpit_{seat_name}_Buckle_Btn", (buckle_x, -0.06, 0.36), (0.025, 0.035, 0.012), mats["seatbelt_red_button"], bevel=0.001)
        strap_sign = -1 if sx < 0 else 1
        make_box(f"Cockpit_{seat_name}_Seatbelt_Webbing", (sx + strap_sign * 0.12, -0.08, 0.68), (0.05, 0.08, 0.65), mats["seatbelt_webbing"], bevel=0.002)

    # 6. B-Pillar Trims with Seatbelt Height Adjusters, Chrome D-Rings & Leather Assist Handles
    for side, sign in [("L", -1), ("R", 1)]:
        bx = sign * 0.74
        make_box(f"Cockpit_BPillar_Trim_{side}", (bx, -0.15, 0.75), (0.06, 0.14, 0.85), mats["leather_ebony"], bevel=0.008)
        make_seatbelt_height_adjuster(f"Cockpit_BPillar_Adjuster_{side}", (bx - sign * 0.028, -0.15, 0.86), 0.22, mats, sign=sign)
        make_b_pillar_assist_handle(f"Cockpit_Exec_Assist_{side}", (bx - sign * 0.024, -0.05, 0.95), length=0.18, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_cognac")

    # 7. Executive Steering Wheel & Column with Stalk Module & Knurled Thumbwheels
    make_steering_column_stalk_module("Cockpit_Executive_Stalks", (-0.38, 0.42, 0.72), mats=mats)
    make_torus("Cockpit_Steering_Rim", (-0.38, 0.36, 0.72), 0.185, 0.017, (math.radians(70), 0, 0), mats["leather_ebony"])
    make_cylinder("Cockpit_Steering_Boss", (-0.38, 0.38, 0.72), 0.065, 0.035, (math.radians(70), 0, 0), mats["leather_ebony"], vertices=36, bevel=0.005)
    make_knurled_cylinder("Cockpit_Steering_Thumbwheel_L", (-0.46, 0.36, 0.72), 0.008, 0.016, (math.radians(70), 0, 0), mats["metal_brushed"], ridges=16)
    make_knurled_cylinder("Cockpit_Steering_Thumbwheel_R", (-0.30, 0.36, 0.72), 0.008, 0.016, (math.radians(70), 0, 0), mats["metal_brushed"], ridges=16)
    make_steering_thumb_encoders_and_magnetic_paddles("Cockpit_Exec_Steering_Hardware", (-0.38, 0.36, 0.72), yoke_w=0.34, yoke_h=0.22, rot_euler=(math.radians(70), 0, 0), mats=mats, stripe_color="yellow")

    # 8. Door Cards with Bowers & Wilkins Acoustic Dispersion Grilles & Articulated Latches
    for side, sign in [("L", -1), ("R", 1)]:
        dx = sign * 0.74
        make_box(f"Cockpit_Door_{side}", (dx, 0.0, 0.50), (0.08, 1.10, 0.58), mats["leather_ebony"], bevel=0.014)
        make_box(f"Cockpit_Door_Armrest_{side}", (dx - sign * 0.05, 0.05, 0.52), (0.06, 0.46, 0.06), mats["leather_cognac"], bevel=0.010)
        make_articulated_door_latch(f"Cockpit_Door_Latch_{side}", (dx - sign * 0.045, 0.22, 0.56), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=side, finish="chrome")
        make_high_end_acoustic_speaker_array(f"Cockpit_Door_HighEnd_Acoustic_{side}", (dx - sign * 0.042, 0.28, 0.32), radius=0.072, depth=0.018, rot_euler=(0, math.radians(90 * sign), 0), mats=mats, finish="chrome")
        make_seat_adjustment_switchpack(f"Cockpit_Door_SeatSwitch_{side}", (dx - sign * 0.044, 0.16, 0.62), mats=mats, finish="chrome")
        make_pill_cylinder(f"Cockpit_Door_Window_Switch_{side}", (dx - sign * 0.058, 0.18, 0.555), 0.005, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"])
        make_illuminated_door_sill_kickplate(f"Cockpit_Exec_Sill_{side}", (dx, 0.05, 0.12), (0, 0, 0), mats, script_text="EXECUTIVE", carbon=False)

    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("Cockpit_Executive_Tourbillon", (0.06, 0.56, 0.835), mats=mats)
    make_augmented_reality_hud_collimator("Cockpit_Executive_AR_HUD", (-0.38, 0.62, 0.82), mats=mats)
    make_steering_column_telescopic_shroud("Cockpit_Executive_Steering_Shroud", (-0.38, 0.44, 0.65), mats=mats)
    make_haptic_rotary_command_dial("Cockpit_Executive_Haptic_Dial", (0.0, 0.04, 0.415), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("Cockpit_Executive_Refrigerated_Bar", (0.0, -0.65, 0.28), mats=mats)
    make_3d_knitted_perforated_seat_accent("Cockpit_Driver_3DKnit", (-0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="anodized_petrol_blue")
    make_3d_knitted_perforated_seat_accent("Cockpit_Pass_3DKnit", (0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="anodized_petrol_blue")

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Cockpit_Exec_Cinema_Virtual", (0.0, 0.52, 0.74), mats=mats)
    make_smart_glass_roof_segments_and_grab_handles("Cockpit_Exec_SmartGlass_GrabHandles", (0.0, 0.0, 1.35), mats=mats)
    make_pneumatic_lumbar_air_harness("Cockpit_Driver_Lumbar_Harness", (-0.38, -0.16, 0.65), mats=mats)
    make_pneumatic_lumbar_air_harness("Cockpit_Pass_Lumbar_Harness", (0.38, -0.16, 0.65), mats=mats)
    make_ottoman_calf_rest_and_footrest_assembly("Cockpit_Pass_Ottoman", (0.38, 0.36, 0.22), mats=mats)
    make_door_concealed_umbrella_system("Cockpit_Door_Umbrella_L", (-0.74, 0.38, 0.35), mats=mats)
    make_door_concealed_umbrella_system("Cockpit_Door_Umbrella_R", (0.74, 0.38, 0.35), mats=mats)
    make_inductive_phone_charging_station("Cockpit_Exec_Inductive_Phone", (0.0, 0.35, 0.405), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Cockpit_Exec_RibbonTweeter_L", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Cockpit_Exec_RibbonTweeter_R", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)

    export_active_scene_to_glb(output_path)

def build_complete_gt3_cockpit(output_path):
    print(f"\n[BUILD] Engineering Complete GT3 Competition Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. FIA Full Tubular Roll Cage Structure (Chrome-moly steel) with Grade 12.9 Junction Bolts
    cage_r = 0.022
    make_cylinder("GT3_Cage_MainHoop_L", (-0.68, -0.15, 0.75), cage_r, 1.20, (0, 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("GT3_Cage_MainHoop_R", (0.68, -0.15, 0.75), cage_r, 1.20, (0, 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("GT3_Cage_CrossBar_Top", (0.0, -0.15, 1.34), cage_r, 1.36, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)
    make_cylinder("GT3_Cage_Diagonal_Brace", (0.0, -0.15, 0.75), cage_r, 1.62, (0, math.radians(52), 0), mats["metal_brushed"], vertices=24)
    # Motorsport Gusset Reinforcement Plates with Flared Lightening Holes
    make_gusset_bracket("GT3_Cage_Gusset_TL", (-0.60, -0.15, 1.26), (0.12, 0.012, 0.12), 0.022, (0, 0, 0), mats["titanium_finish"])
    make_gusset_bracket("GT3_Cage_Gusset_TR", (0.60, -0.15, 1.26), (0.12, 0.012, 0.12), 0.022, (0, 0, 0), mats["titanium_finish"])
    make_cylinder("GT3_Cage_A_Pillar_L", (-0.68, 0.35, 0.75), cage_r, 1.15, (math.radians(-32), 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("GT3_Cage_A_Pillar_R", (0.68, 0.35, 0.75), cage_r, 1.15, (math.radians(-32), 0, 0), mats["metal_brushed"], vertices=24)
    make_torus("GT3_Master_Cutoff_Loop", (-0.66, 0.30, 0.95), 0.025, 0.005, (0, 0, 0), mats["anodized_red"])

    # High-impact SFI 45.1 roll cage impact padding on driver contact zones
    make_rollcage_impact_padding("GT3_Padding_A_Pillar_L", (-0.68, 0.35, 0.85), length=0.35, radius=0.026, rot_euler=(math.radians(-32), 0, 0), mats=mats)
    make_rollcage_impact_padding("GT3_Padding_A_Pillar_R", (0.68, 0.35, 0.85), length=0.35, radius=0.026, rot_euler=(math.radians(-32), 0, 0), mats=mats)
    make_rollcage_impact_padding("GT3_Padding_CrossBar_Top", (0.0, -0.15, 1.34), length=0.45, radius=0.026, rot_euler=(0, math.radians(90), 0), mats=mats)

    # Roll cage Grade 12.9 titanium junction bolts
    for c_bolt_x in [-0.68, 0.68]:
        make_hex_bolt(f"GT3_Cage_Foot_Bolt_F_{c_bolt_x}", (c_bolt_x, 0.35, 0.18), 0.008, 0.008, (0, 0, 0), mats["titanium_finish"])
        make_hex_bolt(f"GT3_Cage_Foot_Bolt_R_{c_bolt_x}", (c_bolt_x, -0.15, 0.16), 0.008, 0.008, (0, 0, 0), mats["titanium_finish"])

    # 2. Textured Floor Grip Tape Runner Strips
    for strip_i in range(3):
        make_box(f"GT3_Floor_Grip_Strip_{strip_i+1}", (-0.38, 0.20 + strip_i * 0.12, 0.105), (0.28, 0.08, 0.004), mats["rubber_traction"], bevel=0)

    # 3. Carbon Fiber Dash Shroud, Telemetry Display, HUD & Rally Trip Computer
    make_box("GT3_Cockpit_Dash_Carbon", (0.0, 0.55, 0.74), (1.40, 0.50, 0.08), mats["carbon_twill"], bevel=0.012)
    make_box("GT3_Cockpit_Telemetry_Screen", (-0.36, 0.52, 0.76), (0.38, 0.015, 0.14), mats["screen_oled"], bevel=0.002)
    make_hud_glass_projector("GT3_Cockpit_HUD", (-0.36, 0.58, 0.79), (0.20, 0.15, 0.045), mats)
    # Precision Turbine AC Vents (Motorsport Anodized Red)
    for gv_i, gv_x in enumerate([-0.58, 0.58]):
        make_precision_turbine_ac_vent(f"GT3_Cockpit_Turbine_Vent_{gv_i+1}", (gv_x, 0.52, 0.72), 0.032, depth=0.022, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=6, illuminated=False, bezel_mat=mats["anodized_red"], core_mat=mats["titanium_finish"])

    # Co-Driver Rally Tripcomputer & Passenger Grab Bar with Titanium Bolts
    make_box("GT3_Cockpit_TripComputer", (0.34, 0.52, 0.74), (0.16, 0.06, 0.10), mats["titanium_finish"], bevel=0.003)
    make_box("GT3_Cockpit_TripComputer_Screen", (0.34, 0.488, 0.74), (0.13, 0.005, 0.07), mats["screen_oled"], bevel=0.001)
    make_cylinder("GT3_Cockpit_GrabBar", (0.34, 0.44, 0.80), 0.012, 0.26, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)
    make_hex_bolt("GT3_Cockpit_GrabBar_Bolt_L", (0.21, 0.44, 0.80), 0.006, 0.006, (0, math.radians(90), 0), mats["titanium_finish"])
    make_hex_bolt("GT3_Cockpit_GrabBar_Bolt_R", (0.47, 0.44, 0.80), 0.006, 0.006, (0, math.radians(90), 0), mats["titanium_finish"])

    # 4. Carbon Center Console, Exposed Horological Shifter, Swivel Blower & LifeLine Fire Suppression
    make_box("GT3_Cockpit_Console_Carbon", (0.0, 0.0, 0.24), (0.28, 1.05, 0.28), mats["carbon_twill"], bevel=0.012)
    make_exposed_horological_shifter_linkage("GT3_Cockpit_Horological_Shifter", (0.0, 0.05, 0.28), size=(0.14, 0.20, 0.12), mats=mats, gold=True, gear=3)
    make_aircraft_toggle_switch_bank("GT3_Cockpit_ToggleBank", (0.0, 0.38, 0.36), switch_count=4, rot_euler=(math.radians(25), 0, 0), mats=mats, carbon_plate=True)
    make_cylinder("GT3_Cockpit_Blower_Base", (0.09, -0.16, 0.32), 0.020, 0.015, (0, 0, 0), mats["titanium_finish"], vertices=24)
    make_cylinder("GT3_Cockpit_Blower_Nozzle", (0.09, -0.16, 0.34), 0.016, 0.030, (math.radians(-30), 0, 0), mats["billet_aluminum"], vertices=24)
    make_start_stop_button_with_flip_cover("GT3_Cockpit_Start_Stop", (-0.06, 0.24, 0.38), 0.015, 0.012, (0, 0, 0), mats)
    make_cylinder("GT3_Cockpit_Ebrake_Lever", (0.07, -0.06, 0.46), 0.014, 0.32, (math.radians(-15), 0, 0), mats["anodized_red"], vertices=24, bevel=0.003)
    make_fire_suppression_system("GT3_Cockpit_Fire_Suppression", (0.38, 0.15, 0.22), size=(0.11, 0.32, 0.11), rot_euler=(0, math.radians(90), 0), mats=mats)

    # 5. Carbon Racing Bucket Seat (Driver) with FIA 6-Point Harness & Floor Hex Hardware
    make_box("GT3_Cockpit_Seat_Shell", (-0.38, -0.10, 0.68), (0.48, 0.52, 0.86), mats["carbon_twill"], bevel=0.016)
    make_box("GT3_Cockpit_Seat_Cushion", (-0.38, 0.05, 0.30), (0.38, 0.40, 0.06), mats["alcantara_charcoal"], bevel=0.010)
    make_box("GT3_Cockpit_Harness_L", (-0.46, -0.05, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_box("GT3_Cockpit_Harness_R", (-0.30, -0.05, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_cylinder("GT3_Cockpit_Camlock_Buckle", (-0.38, 0.03, 0.38), 0.035, 0.024, (math.radians(35), 0, 0), mats["metal_brushed"], vertices=28, bevel=0.002)
    make_racing_harness_system("GT3_Cockpit_FIA_Harness", (-0.38, -0.06, 0.30), mats=mats, color="red")
    for s_hx in [-0.58, -0.18]:
        for s_hy in [-0.28, 0.15]:
            make_hex_bolt(f"GT3_Seat_Mount_Hex_{s_hx}_{s_hy}", (s_hx, s_hy, 0.14), 0.007, 0.006, (0, 0, 0), mats["titanium_finish"])

    # 6. Carbon Telemetry Steering Yoke with Stalk Module & Knurled Manettino Encoders
    make_steering_column_stalk_module("GT3_Cockpit_Stalks", (-0.38, 0.40, 0.72), mats=mats, stalk_length=0.11)
    make_box("GT3_Cockpit_Yoke_Plate", (-0.38, 0.34, 0.72), (0.28, 0.025, 0.18), mats["carbon_twill"], bevel=0.006)
    make_cylinder("GT3_Cockpit_Yoke_Grip_L", (-0.51, 0.34, 0.72), 0.022, 0.16, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.003)
    make_cylinder("GT3_Cockpit_Yoke_Grip_R", (-0.25, 0.34, 0.72), 0.022, 0.16, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.003)
    make_knurled_cylinder("GT3_Cockpit_TC_Dial", (-0.43, 0.325, 0.69), 0.011, 0.012, (math.radians(70), 0, 0), mats["anodized_gold"], ridges=16)
    make_knurled_cylinder("GT3_Cockpit_ABS_Dial", (-0.33, 0.325, 0.69), 0.011, 0.012, (math.radians(70), 0, 0), mats["anodized_red"], ridges=16)
    make_steering_thumb_encoders_and_magnetic_paddles("GT3_Cockpit_Yoke_Hardware", (-0.38, 0.34, 0.72), yoke_w=0.30, yoke_h=0.18, rot_euler=(0, 0, 0), mats=mats, stripe_color="yellow")

    # 7. Competition Pedals with 3D Helical Return Spring & CNC Billet Dead Pedal Footrest
    make_dead_pedal_footrest("GT3_Cockpit_DeadPedal", (-0.52, 0.62, 0.16), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)
    make_box("GT3_Cockpit_BrakePedal", (-0.38, 0.58, 0.20), (0.075, 0.10, 0.025), mats["metal_brushed"], bevel=0.002)
    make_spring_coil("GT3_Cockpit_Brake_Spring", (-0.38, 0.64, 0.23), 0.012, 0.006, 5, 0.002, (math.radians(-90), 0, 0), mats["anodized_red"])
    make_pedal_pushrod_linkage("GT3_Cockpit_Brake_Pushrod", (-0.38, 0.60, 0.20), mats=mats)
    make_box("GT3_Cockpit_GasPedal", (-0.24, 0.56, 0.18), (0.055, 0.18, 0.022), mats["metal_brushed"], bevel=0.002)

    # 8. FIA Competition Window Safety Net & Forged Carbon Door Sill Kickplates
    make_motorsport_window_safety_net("GT3_Window_Safety_Net", (-0.68, 0.10, 0.88), (0.015, 0.54, 0.42), (0, 0, 0), mats, webbing_mat="safety_webbing_blue")
    make_illuminated_door_sill_kickplate("GT3_Sill_L", (-0.70, 0.05, 0.12), (0, 0, 0), mats, script_text="GT3 RS", carbon=True)
    make_illuminated_door_sill_kickplate("GT3_Sill_R", (0.70, 0.05, 0.12), (0, 0, 0), mats, script_text="GT3 RS", carbon=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_hydraulic_handbrake_assembly("GT3_Cockpit_Hydraulic_Handbrake", (0.07, -0.06, 0.30), mats=mats, finish="anodized_red")
    make_footwell_night_navigation_gooseneck("GT3_Cockpit_Nav_Gooseneck", (-0.11, 0.35, 0.28), mats=mats)
    make_steering_column_telescopic_shroud("GT3_Cockpit_Telescopic_Shroud", (-0.38, 0.40, 0.65), mats=mats)
    make_augmented_reality_hud_collimator("GT3_Cockpit_AR_HUD", (-0.38, 0.60, 0.81), mats=mats)
    make_3d_knitted_perforated_seat_accent("GT3_Cockpit_Driver_3DKnit", (-0.38, 0.05, 0.335), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_red")

    export_active_scene_to_glb(output_path)

def build_executive_theater_cockpit(output_path):
    print(f"\n[BUILD] Engineering Executive VIP Theater Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Luxurious Front Cabin Components & Tailored Floor Mats
    make_box("Theater_Floor_Carpet", (0.0, 0.10, 0.12), (1.52, 2.10, 0.04), mats["carpet_tufted"], bevel=0.008)
    make_tailored_floor_mat("Theater_FloorMat_Driver", (-0.38, 0.30, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony")
    make_tailored_floor_mat("Theater_FloorMat_Pass", (0.38, 0.30, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony")
    make_tailored_floor_mat("Theater_FloorMat_RearLounge", (0.0, -0.35, 0.125), (1.10, 0.70, 0.012), mats=mats, trim_leather="leather_beige")
    make_box("Theater_Executive_Dash", (0.0, 0.68, 0.76), (1.46, 0.50, 0.10), mats["leather_ebony"], bevel=0.014)
    make_hud_glass_projector("Theater_HUD", (-0.38, 0.70, 0.81), (0.22, 0.16, 0.05), mats)
    for tv_i, tv_x in enumerate([-0.62, -0.16, 0.16, 0.62]):
        make_precision_turbine_ac_vent(f"Theater_Turbine_Vent_{tv_i+1}", (tv_x, 0.65, 0.74), 0.034, depth=0.024, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=8, illuminated=True, bezel_mat=mats["chrome_jewel"])
    make_steering_column_stalk_module("Theater_Steering_Stalks", (-0.38, 0.52, 0.72), mats=mats)
    make_electronic_gear_shifter("Theater_Electronic_Shifter", (0.0, 0.26, 0.38), (0.045, 0.075, 0.090), mats=mats, crystal=True)
    make_frameless_electrochromic_mirror("Theater_Electrochromic_Mirror", (0.0, 0.52, 0.98), (0, 0, 0), mats)
    make_burmester_acoustic_tweeter_orb("Theater_Tweeter_L", (-0.68, 0.58, 0.80), (0, math.radians(40), 0), mats, finish="chrome")
    make_burmester_acoustic_tweeter_orb("Theater_Tweeter_R", (0.68, 0.58, 0.80), (0, math.radians(-40), 0), mats, finish="chrome")

    # 2. Motorized Partition Wall with Electrochromic Smart Glass & High-End Burmester Acoustic Arrays
    make_box("Theater_Partition_Lower_Wall", (0.0, 0.12, 0.55), (1.48, 0.08, 0.85), mats["wood_walnut"], bevel=0.012)
    make_box("Theater_Partition_Smart_Glass", (0.0, 0.12, 1.15), (1.42, 0.02, 0.35), mats["glass_clear"], bevel=0.004)
    for p_x in [-0.65, -0.22, 0.22, 0.65]:
        make_hex_bolt(f"Theater_Partition_Bolt_{p_x}", (p_x, 0.12, 0.98), 0.006, 0.008, (math.radians(90), 0, 0), mats["titanium_finish"])
    make_high_end_acoustic_speaker_array("Theater_Partition_Burmester_L", (-0.48, 0.12, 0.42), radius=0.080, depth=0.018, rot_euler=(math.radians(90), 0, 0), mats=mats, finish="chrome")
    make_high_end_acoustic_speaker_array("Theater_Partition_Burmester_R", (0.48, 0.12, 0.42), radius=0.080, depth=0.018, rot_euler=(math.radians(90), 0, 0), mats=mats, finish="chrome")

    # 3. 31.3-inch 8K Ultra-Wide Panoramic Theater Cinema Screen
    make_box("Theater_Drop_Screen_Housing", (0.0, 0.10, 1.34), (1.10, 0.06, 0.04), mats["metal_brushed"], bevel=0.004)
    make_box("Theater_Cinema_Display_Active", (0.0, 0.08, 1.08), (0.98, 0.018, 0.42), mats["screen_oled"], bevel=0.004)
    make_box("Theater_Cinema_Display_Frame", (0.0, 0.075, 1.08), (1.00, 0.022, 0.44), mats["wood_pianoblack"], bevel=0.004)

    # 4. VIP First-Class Ottoman Reclining Rear Seats & Writing Tables with Micro-Engineering Controls
    for s_name, sx in [("L", -0.38), ("R", 0.38)]:
        make_box(f"Theater_VIP_Seat_Cushion_{s_name}", (sx, -0.45, 0.32), (0.50, 0.54, 0.16), mats["leather_beige"], bevel=0.018)
        make_box(f"Theater_VIP_Seat_Ottoman_{s_name}", (sx, -0.12, 0.28), (0.46, 0.32, 0.12), mats["leather_beige"], bevel=0.014)
        make_box(f"Theater_VIP_Backrest_{s_name}", (sx, -0.74, 0.72), (0.48, 0.16, 0.65), mats["leather_beige"], bevel=0.018)
        make_box(f"Theater_VIP_Headrest_Pillow_{s_name}", (sx, -0.70, 1.08), (0.28, 0.08, 0.16), mats["leather_cognac"], bevel=0.012)
        make_headrest_crest_medallion(f"Theater_VIP_Headrest_Crest_{s_name}", (sx, -0.655, 1.08), (math.radians(90), 0, 0), mats, finish="gold")
        
        # Tactile pill rockers for motorized recline & ottoman deployment
        v_sign = -1 if sx < 0 else 1
        ctrl_x = sx + v_sign * 0.26
        make_seat_adjustment_switchpack(f"Theater_VIP_SeatSwitch_{s_name}", (ctrl_x, -0.32, 0.44), mats=mats, finish="chrome")
        make_pill_cylinder(f"Theater_VIP_Recline_Rocker_{s_name}", (ctrl_x, -0.38, 0.42), 0.006, 0.026, (0, math.radians(90), 0), mats["chrome_jewel"])
        make_knurled_cylinder(f"Theater_VIP_Massage_Dial_{s_name}", (ctrl_x, -0.46, 0.42), 0.012, 0.014, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=20)
        
        # ISOFIX Child Seat Safety Anchors in VIP Seat Bight
        make_isofix_anchor_flap(f"Theater_VIP_ISOFIX_L_{s_name}", (sx - 0.14, -0.66, 0.28), (0.045, 0.035, 0.025), mats)
        make_isofix_anchor_flap(f"Theater_VIP_ISOFIX_R_{s_name}", (sx + 0.14, -0.66, 0.28), (0.045, 0.035, 0.025), mats)
        
        make_box(f"Theater_Tray_Table_{s_name}", (sx, -0.15, 0.64), (0.42, 0.28, 0.018), mats["wood_walnut"], bevel=0.004)
        make_cylinder(f"Theater_Tray_Arm_{s_name}", (sx - 0.20, -0.15, 0.58), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=16)

    # 4b. B-Pillars with Seatbelt Height Adjusters, VIP Articulated Latches & French-Seamed Assist Handles
    for s_name, s_sign in [("L", -1), ("R", 1)]:
        make_seatbelt_height_adjuster(f"Theater_BPillar_Adjuster_{s_name}", (s_sign * 0.72, -0.15, 0.86), 0.22, mats, sign=s_sign)
        make_articulated_door_latch(f"Theater_VIP_Door_Latch_{s_name}", (s_sign * 0.70, -0.30, 0.52), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=s_name, finish="chrome")
        make_b_pillar_assist_handle(f"Theater_Assist_Handle_{s_name}", (s_sign * 0.71, -0.15, 0.98), length=0.18, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_beige", finish="chrome")

    # 5. Center Champagne Chiller with Knurled Temperature Collar, OLED Dial, Wireless Charging & Thermoelectric Dual-Zone Cupholders
    make_box("Theater_Champagne_Console", (0.0, -0.48, 0.36), (0.24, 0.75, 0.32), mats["wood_walnut"], bevel=0.012)
    make_wireless_charging_pad("Theater_Wireless_Charger", (0.0, -0.68, 0.49), (0.15, 0.085, 0.008), mats)
    make_climate_hvac_roller("Theater_Rear_HVAC_Roller", (0.0, -0.22, 0.52), 0.012, 0.022, mats)
    make_cylinder("Theater_Champagne_Bottle_Chiller", (0.0, -0.35, 0.48), 0.055, 0.12, (0, 0, 0), mats["metal_brushed"], vertices=32, bevel=0.003)
    make_knurled_cylinder("Theater_Chiller_Knurled_Collar", (0.0, -0.35, 0.54), 0.058, 0.012, (0, 0, 0), mats["chrome_jewel"], ridges=32)
    make_rotary_dial_with_oled("Theater_OLED_Chiller_Dial", (0.0, -0.48, 0.52), 0.042, 0.020, (0, 0, 0), mats)
    make_box("Theater_Rear_Control_Touchscreen", (0.0, -0.58, 0.48), (0.16, 0.10, 0.012), mats["screen_oled"], bevel=0.002)
    make_thermoelectric_cup_holder("Theater_VIP_ThermoCupholders", (0.0, -0.32, 0.49), mats=mats, finish="chrome")
    make_vip_airline_tray_table_and_bar("Theater_VIP_Tray_Bar", (0.0, -0.38, 0.46), mats=mats, wood_finish="walnut", extended=False)
    make_fragrance_atomizer_flacon("Theater_Fragrance_Flacon", (0.0, 0.18, 0.40), mats=mats)
    for fl_x in [-0.06, 0.06]:
        make_cylinder(f"Theater_Flute_Stem_{'L' if fl_x < 0 else 'R'}", (fl_x, -0.22, 0.52), 0.004, 0.08, (0, 0, 0), mats["glass_clear"], vertices=16)
        make_cylinder(f"Theater_Flute_Bowl_{'L' if fl_x < 0 else 'R'}", (fl_x, -0.22, 0.58), 0.022, 0.06, (0, 0, 0), mats["glass_clear"], vertices=24)

    # 6. Illuminated VIP Salon Door Sill Kickplates
    make_illuminated_door_sill_kickplate("Theater_Sill_L", (-0.72, -0.15, 0.12), (0, 0, 0), mats, script_text="MAYBACH VIP", carbon=False)
    make_illuminated_door_sill_kickplate("Theater_Sill_R", (0.72, -0.15, 0.12), (0, 0, 0), mats, script_text="MAYBACH VIP", carbon=False)

    # v13.0 Ultimate Craftsmanship Additions
    make_rear_vip_refrigerated_bar_cabinet("Theater_VIP_Refrigerated_Bar", (0.0, -0.55, 0.28), mats=mats)
    make_tourbillon_multi_axis_escapement("Theater_Tourbillon", (0.0, -0.22, 0.58), mats=mats)
    make_haptic_rotary_command_dial("Theater_Haptic_Dial", (0.0, -0.48, 0.53), mats=mats)
    make_3d_knitted_perforated_seat_accent("Theater_VIP_Seat_3DKnit_L", (-0.38, -0.45, 0.38), size=(0.34, 0.38, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")
    make_3d_knitted_perforated_seat_accent("Theater_VIP_Seat_3DKnit_R", (0.38, -0.45, 0.38), size=(0.34, 0.38, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")

    export_active_scene_to_glb(output_path)

def build_hypercar_halo_cockpit(output_path):
    print(f"\n[BUILD] Engineering Le Mans Hypercar Halo Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. 3K Carbon Tub & Monocoque Chassis
    make_box("Halo_Carbon_Tub_Monocoque", (0.0, 0.10, 0.35), (1.42, 1.95, 0.55), mats["carbon_twill"], bevel=0.018)

    # 2. Structural Titanium Safety Halo Strut with Grade 12.9 Titanium Anchors & Impact Padding
    halo_r = 0.024
    make_cylinder("Halo_Central_Strut_Front", (0.0, 0.38, 0.85), halo_r, 0.45, (math.radians(-28), 0, 0), mats["titanium_finish"], vertices=24)
    make_rollcage_impact_padding("Halo_Strut_Impact_Pad", (0.0, 0.22, 0.92), length=0.28, radius=0.030, rot_euler=(math.radians(-28), 0, 0), mats=mats)
    make_torus("Halo_Head_Protection_Loop", (0.0, 0.0, 1.05), 0.38, halo_r, (math.radians(10), 0, 0), mats["titanium_finish"])
    make_hex_bolt("Halo_Strut_Front_Bolt", (0.0, 0.38, 0.62), 0.010, 0.014, (0, 0, 0), mats["titanium_finish"])
    make_hex_bolt("Halo_Strut_Rear_Bolt_L", (-0.38, 0.0, 1.05), 0.010, 0.014, (0, math.radians(90), 0), mats["titanium_finish"])
    make_hex_bolt("Halo_Strut_Rear_Bolt_R", (0.38, 0.0, 1.05), 0.010, 0.014, (0, math.radians(90), 0), mats["titanium_finish"])

    # 2b. FIA Competition Window Safety Net & Frameless Electrochromic Digital Rearview Mirror
    make_motorsport_window_safety_net("Halo_Window_Safety_Net", (-0.68, 0.05, 0.85), (0.015, 0.52, 0.40), (0, 0, 0), mats, webbing_mat="harness_red")
    make_frameless_electrochromic_mirror("Halo_Electrochromic_Mirror", (0.0, 0.38, 0.98), (0, 0, 0), mats)

    # 3. Carbon Yoke, Telemetry Display, Anti-Glare HUD & Turbine Air Vents
    make_steering_column_stalk_module("Halo_Steering_Stalks", (0.0, 0.38, 0.68), mats=mats, stalk_length=0.11)
    make_box("Halo_Yoke_Plate", (0.0, 0.32, 0.68), (0.28, 0.025, 0.16), mats["carbon_twill"], bevel=0.006)
    make_box("Halo_Telemetry_Screen", (0.0, 0.31, 0.71), (0.14, 0.008, 0.08), mats["screen_oled"], bevel=0.001)
    make_knurled_cylinder("Halo_Yoke_Thumbwheel_L", (-0.08, 0.31, 0.68), 0.009, 0.014, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)
    make_knurled_cylinder("Halo_Yoke_Thumbwheel_R", (0.08, 0.31, 0.68), 0.009, 0.014, (0, math.radians(90), 0), mats["chrome_jewel"], ridges=18)
    make_paddle_micro_switch("Halo_Paddle_Switch_L", (-0.11, 0.34, 0.68), (0.012, 0.016, 0.018), mats)
    make_paddle_micro_switch("Halo_Paddle_Switch_R", (0.11, 0.34, 0.68), (0.012, 0.016, 0.018), mats)
    make_steering_thumb_encoders_and_magnetic_paddles("Halo_Yoke_Hardware", (0.0, 0.32, 0.68), yoke_w=0.28, yoke_h=0.18, rot_euler=(0, 0, 0), mats=mats, stripe_color="yellow")
    make_hud_glass_projector("Halo_HUD", (0.0, 0.40, 0.78), (0.22, 0.15, 0.045), mats)
    for hv_i, hv_x in enumerate([-0.24, 0.24]):
        make_precision_turbine_ac_vent(f"Halo_Turbine_Vent_{hv_i+1}", (hv_x, 0.36, 0.72), 0.030, depth=0.020, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=6, illuminated=True, bezel_mat=mats["titanium_finish"], core_mat=mats["carbon_forged"])

    # 3b. Center Carbon Spine: Aircraft Toggles, Exposed Horological Shifter, OLED Mode Dial, Start/Stop Safety Flip Cover & LifeLine Fire Suppression
    make_aircraft_toggle_switch_bank("Halo_Cockpit_Toggles", (0.0, 0.36, 0.36), switch_count=4, rot_euler=(math.radians(30), 0, 0), mats=mats, carbon_plate=True)
    make_start_stop_button_with_flip_cover("Halo_StartStop_FlipGuard", (0.0, 0.28, 0.34), 0.022, mats)
    make_rotary_dial_with_oled("Halo_DriveMode_Dial", (0.0, 0.12, 0.36), 0.038, 0.018, (0, 0, 0), mats)
    make_exposed_horological_shifter_linkage("Halo_Horological_Shifter", (0.0, 0.02, 0.34), size=(0.12, 0.18, 0.10), mats=mats, gold=False, gear=3)
    make_fire_suppression_system("Halo_LifeLine_Extinguisher", (0.32, 0.15, 0.22), size=(0.10, 0.30, 0.10), rot_euler=(0, math.radians(90), 0), mats=mats)
    make_deployable_cupholder("Halo_Deployable_Hydration_Port", (0.0, 0.20, 0.32), 0.035, 0.045, mats)

    # 4. Central Monocoque Carbon Bucket Seat with FIA 6-Point Harness & Floor Hex Fasteners
    make_box("Halo_Driver_Bucket_Shell", (0.0, -0.15, 0.65), (0.48, 0.54, 0.85), mats["carbon_twill"], bevel=0.016)
    make_box("Halo_Driver_Cushion", (0.0, 0.0, 0.28), (0.40, 0.42, 0.06), mats["alcantara_charcoal"], bevel=0.010)
    make_box("Halo_Harness_L", (-0.08, -0.10, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_box("Halo_Harness_R", (0.08, -0.10, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_racing_harness_system("Halo_Driver_FIA_Harness", (0.0, -0.06, 0.28), mats=mats, color="red")
    for bx in [-0.20, 0.20]:
        for by in [-0.28, 0.10]:
            make_hex_bolt(f"Halo_Seat_Bolt_{bx}_{by}", (bx, by, 0.14), 0.007, 0.006, (0, 0, 0), mats["titanium_finish"])

    # 4b. Dead Pedal CNC Billet Footrest & Master Cylinder Pushrod Linkage
    make_dead_pedal_footrest("Halo_DeadPedal", (-0.48, 0.54, 0.20), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)
    make_pedal_pushrod_linkage("Halo_Brake_Pushrod", (-0.10, 0.58, 0.20), mats=mats)

    # 5. Roof Intake Snorkel Channel
    make_cylinder("Halo_Roof_Snorkel_Tube", (0.0, -0.20, 1.28), 0.08, 0.65, (math.radians(-75), 0, 0), mats["carbon_forged"], vertices=32, bevel=0.008)

    # 6. Forged Carbon Monocoque Door Sill Scuff Plates
    make_illuminated_door_sill_kickplate("Halo_Sill_L", (-0.69, 0.05, 0.16), (0, 0, 0), mats, script_text="HYPERCAR LMP", carbon=True)
    make_illuminated_door_sill_kickplate("Halo_Sill_R", (0.69, 0.05, 0.16), (0, 0, 0), mats, script_text="HYPERCAR LMP", carbon=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_hydraulic_handbrake_assembly("Halo_Hydraulic_Handbrake", (0.10, -0.04, 0.34), mats=mats, finish="anodized_red")
    make_footwell_night_navigation_gooseneck("Halo_Nav_Gooseneck", (-0.20, 0.35, 0.28), mats=mats)
    make_augmented_reality_hud_collimator("Halo_AR_HUD_Collimator", (0.0, 0.44, 0.82), mats=mats)
    make_3d_knitted_perforated_seat_accent("Halo_Driver_3DKnit", (0.0, 0.0, 0.315), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="anodized_red")

    export_active_scene_to_glb(output_path)

def build_quantum_hyperblade_cockpit(output_path):
    print(f"\n[BUILD] Engineering Quantum Hyperblade EV Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Sleek Monolithic Carbon-Composite Tub, Photonic Ribbons & Tailored Floor Mats
    make_box("Quantum_Composite_Tub", (0.0, 0.10, 0.25), (1.46, 1.85, 0.35), mats["carbon_forged"], bevel=0.018)
    make_tailored_floor_mat("Quantum_FloorMat_Driver", (-0.38, 0.25, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony", carbon_heel=True)
    make_tailored_floor_mat("Quantum_FloorMat_Pass", (0.38, 0.25, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony", carbon_heel=False)
    make_dead_pedal_footrest("Quantum_Footrest", (-0.48, 0.54, 0.20), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)
    for q_side, qx in [("L", -0.70), ("R", 0.70)]:
        make_box(f"Quantum_Tub_Glow_Ribbon_{q_side}", (qx, 0.10, 0.38), (0.008, 1.80, 0.006), mats["ambient_iceblue"], bevel=0)

    # 2. Floating Quantum-Dot OLED Glass Blade Dashboard, Combiner HUD & Turbine Vents
    make_box("Quantum_Glass_Blade_Fascia", (0.0, 0.52, 0.74), (1.48, 0.025, 0.22), mats["wood_pianoblack"], bevel=0.006)
    make_hud_glass_projector("Quantum_HUD_Glass_Unit", (-0.40, 0.58, 0.78), (0.22, 0.16, 0.05), mats)
    make_box("Quantum_OLED_Screen_Cluster", (-0.40, 0.50, 0.74), (0.38, 0.01, 0.17), mats["screen_oled"], bevel=0.001)
    make_box("Quantum_OLED_Screen_Center", (0.0, 0.50, 0.74), (0.48, 0.01, 0.19), mats["screen_oled"], bevel=0.001)
    make_box("Quantum_OLED_Screen_Pass", (0.40, 0.50, 0.74), (0.38, 0.01, 0.17), mats["screen_oled"], bevel=0.001)
    make_box("Quantum_Photonic_Light_Blade_Top", (0.0, 0.51, 0.855), (1.46, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)
    make_box("Quantum_Photonic_Light_Blade_Bot", (0.0, 0.51, 0.625), (1.46, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)
    for qv_i, qv_x in enumerate([-0.64, -0.20, 0.20, 0.64]):
        make_precision_turbine_ac_vent(f"Quantum_Turbine_Vent_{qv_i+1}", (qv_x, 0.51, 0.73), 0.030, depth=0.020, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=8, illuminated=True, bezel_mat=mats["titanium_finish"])

    # 2b. Frameless Electrochromic Digital Mirror & Titanium Burmester Rotating Tweeters
    make_frameless_electrochromic_mirror("Quantum_Electrochromic_Mirror", (0.0, 0.48, 0.98), (0, 0, 0), mats)
    make_burmester_acoustic_tweeter_orb("Quantum_Tweeter_L", (-0.68, 0.48, 0.78), (0, math.radians(40), 0), mats, finish="titanium")
    make_burmester_acoustic_tweeter_orb("Quantum_Tweeter_R", (0.68, 0.48, 0.78), (0, math.radians(-40), 0), mats, finish="titanium")

    # 3. Floating Center Bridge, Crystal Shifter, OLED Rotary Dial, Start/Stop Cover, Wireless Charging & Thermoelectric Cupholders
    make_box("Quantum_Console_Bridge", (0.0, 0.05, 0.28), (0.24, 0.95, 0.06), mats["carbon_forged"], bevel=0.008)
    make_start_stop_button_with_flip_cover("Quantum_StartStop_FlipCover", (0.0, 0.28, 0.32), 0.022, mats)
    make_rotary_dial_with_oled("Quantum_Console_OLED_Dial", (0.0, 0.18, 0.32), 0.040, 0.020, (0, 0, 0), mats)
    make_electronic_gear_shifter("Quantum_Crystal_Shifter", (0.0, 0.06, 0.31), (0.042, 0.070, 0.085), mats=mats, crystal=True)
    make_wireless_charging_pad("Quantum_Wireless_Pad", (0.0, -0.06, 0.315), (0.15, 0.085, 0.008), mats)
    make_thermoelectric_cup_holder("Quantum_ThermoCupholders", (0.0, 0.36, 0.29), mats=mats, finish="titanium")
    make_fragrance_atomizer_flacon("Quantum_Fragrance_Flacon", (0.0, -0.14, 0.33), mats=mats)
    make_box("Quantum_Cantilever_Armrest", (0.0, -0.22, 0.36), (0.22, 0.35, 0.05), mats["leather_ebony"], bevel=0.012)

    # 4. Zero-Gravity Floating Sport Seats with Micro-Tactile Controls
    for s_name, sx in [("Driver", -0.38), ("Pass", 0.38)]:
        make_box(f"Quantum_Seat_Shell_{s_name}", (sx, -0.05, 0.65), (0.46, 0.50, 0.85), mats["carbon_forged"], bevel=0.016)
        make_box(f"Quantum_Seat_Pad_{s_name}", (sx, 0.0, 0.28), (0.38, 0.36, 0.08), mats["leather_ebony"], bevel=0.012)
        make_motorized_thigh_extension_bolster(f"Quantum_Thigh_Extension_{s_name}", (sx, 0.22, 0.28), width=0.38, depth=0.12, height=0.10, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_ebony")
        make_box(f"Quantum_Seat_Backpad_{s_name}", (sx, -0.14, 0.70), (0.36, 0.06, 0.58), mats["leather_ebony"], bevel=0.012)
        make_box(f"Quantum_Seat_LED_Ribbon_{s_name}", (sx, -0.17, 0.70), (0.38, 0.004, 0.60), mats["ambient_iceblue"], bevel=0)
        make_headrest_crest_medallion(f"Quantum_Seat_Medallion_{s_name}", (sx, -0.08, 1.05), (math.radians(90), 0, 0), mats, finish="chrome")
        q_sign = -1 if sx < 0 else 1
        make_seat_adjustment_switchpack(f"Quantum_Seat_Switchpack_{s_name}", (sx + q_sign * 0.25, 0.10, 0.30), mats=mats, finish="chrome")
        make_pill_cylinder(f"Quantum_Seat_Pill_{s_name}", (sx + q_sign * 0.24, 0.04, 0.27), 0.005, 0.022, (0, math.radians(90), 0), mats["metal_brushed"])

    # 4b. Acoustic Speaker Grilles & Articulated Latches in Side Monocoque Bulkheads
    for q_side, q_sign in [("L", -1), ("R", 1)]:
        make_high_end_acoustic_speaker_array(f"Quantum_Speaker_Array_{q_side}", (q_sign * 0.68, 0.25, 0.32), radius=0.072, depth=0.018, rot_euler=(0, math.radians(90 * q_sign), 0), mats=mats, finish="titanium")
        make_articulated_door_latch(f"Quantum_Door_Latch_{q_side}", (q_sign * 0.69, 0.15, 0.50), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=q_side, finish="titanium")

    # 5. Quantum Yoke Steering with Stalk Module & Thumb Encoders
    make_steering_column_stalk_module("Quantum_Steering_Stalks", (-0.38, 0.38, 0.72), mats=mats)
    make_torus("Quantum_Steering_Yoke_Rim", (-0.38, 0.32, 0.72), 0.17, 0.016, (math.radians(70), 0, 0), mats["leather_ebony"])
    make_box("Quantum_Steering_Hub", (-0.38, 0.34, 0.72), (0.16, 0.02, 0.08), mats["carbon_forged"], bevel=0.004)
    make_steering_thumb_encoders_and_magnetic_paddles("Quantum_Steering_Hardware", (-0.38, 0.32, 0.72), yoke_w=0.30, yoke_h=0.18, rot_euler=(math.radians(70), 0, 0), mats=mats, stripe_color="yellow")

    # 6. Illuminated Forged Carbon Sill Scuff Plates
    make_illuminated_door_sill_kickplate("Quantum_Sill_L", (-0.72, 0.05, 0.14), (0, 0, 0), mats, script_text="QUANTUM EV", carbon=True)
    make_illuminated_door_sill_kickplate("Quantum_Sill_R", (0.72, 0.05, 0.14), (0, 0, 0), mats, script_text="QUANTUM EV", carbon=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Quantum_AR_HUD_Collimator", (-0.40, 0.58, 0.82), mats=mats)
    make_steering_column_telescopic_shroud("Quantum_Telescopic_Shroud", (-0.38, 0.38, 0.65), mats=mats)
    make_haptic_rotary_command_dial("Quantum_Haptic_MMI_Dial", (0.0, 0.18, 0.33), mats=mats)
    make_3d_knitted_perforated_seat_accent("Quantum_Seat_3DKnit_Driver", (-0.38, 0.0, 0.325), size=(0.32, 0.36, 0.012), mats=mats, accent_mat="anodized_petrol_blue")
    make_3d_knitted_perforated_seat_accent("Quantum_Seat_3DKnit_Pass", (0.38, 0.0, 0.325), size=(0.32, 0.36, 0.012), mats=mats, accent_mat="anodized_petrol_blue")

    export_active_scene_to_glb(output_path)

def build_bespoke_atelier_cockpit(output_path):
    print(f"\n[BUILD] Engineering Bespoke Atelier Artisan Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Monocoque Floor Tub, Deep Tufted Wool Carpet & Tailored Floor Mats
    make_box("Atelier_Floor_Carpet", (0.0, 0.10, 0.12), (1.52, 1.85, 0.04), mats["carpet_tufted"], bevel=0.008)
    make_tailored_floor_mat("Atelier_FloorMat_Driver", (-0.38, 0.25, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_cognac")
    make_tailored_floor_mat("Atelier_FloorMat_Pass", (0.38, 0.25, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_cognac")

    # 2. Driver Brushed Aluminum Heel Rest Plate with Rubber Ribs
    make_box("Atelier_Heel_Rest_Plate", (-0.38, 0.40, 0.145), (0.34, 0.26, 0.008), mats["metal_brushed"], bevel=0.002)
    for h_rib in range(4):
        make_box(f"Atelier_Heel_Rest_Rib_{h_rib+1}", (-0.38, 0.32 + h_rib * 0.05, 0.152), (0.30, 0.015, 0.005), mats["rubber_traction"], bevel=0.001)

    # 3. Bespoke Artisan Dashboard with Two-Tone Navy Leather & Burl Ash Wood Spear
    make_box("Atelier_Dash_Upper_Cowl", (0.0, 0.58, 0.77), (1.46, 0.52, 0.09), mats["leather_navy"], bevel=0.014)
    make_box("Atelier_Dash_Burl_Spear", (0.0, 0.52, 0.72), (1.42, 0.04, 0.08), mats["wood_burl"], bevel=0.006)
    make_box("Atelier_Dash_Gold_Trim", (0.0, 0.505, 0.675), (1.42, 0.012, 0.005), mats["anodized_gold"], bevel=0.001)
    make_box("Atelier_Dash_Ambient_Strip", (0.0, 0.50, 0.672), (1.40, 0.006, 0.006), mats["ambient_amber"], bevel=0)

    # Driver OLED cluster, center infotainment & anti-glare HUD
    make_box("Atelier_Cluster_OLED", (-0.38, 0.54, 0.78), (0.42, 0.015, 0.16), mats["screen_oled"], bevel=0.002)
    make_box("Atelier_Center_Touchscreen", (0.06, 0.51, 0.75), (0.46, 0.018, 0.22), mats["screen_oled"], bevel=0.002)
    make_box("Atelier_Passenger_OLED", (0.46, 0.52, 0.75), (0.38, 0.015, 0.14), mats["screen_passenger"], bevel=0.002)
    make_hud_glass_projector("Atelier_HUD", (-0.38, 0.62, 0.83), (0.22, 0.16, 0.05), mats)

    # Analog Tourbillon Clock with diamond-knurled brass bezel on dash top
    make_cylinder("Atelier_Tourbillon_Clock", (0.06, 0.56, 0.82), 0.038, 0.024, (math.radians(35), 0, 0), mats["chrome_jewel"], vertices=40, bevel=0.003)
    make_knurled_cylinder("Atelier_Tourbillon_Knurled_Bezel", (0.06, 0.56, 0.824), 0.040, 0.012, (math.radians(35), 0, 0), mats["brass_brushed"], ridges=32)

    # Precision Turbine HVAC Vents with gold knurled bezels & organ-stop pulls
    for av_i, av_x in enumerate([-0.54, -0.16, 0.16, 0.54]):
        make_precision_turbine_ac_vent(f"Atelier_Turbine_Vent_{av_i+1}", (av_x, 0.51, 0.725), 0.036, depth=0.024, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=8, illuminated=True, bezel_mat=mats["anodized_gold"], core_mat=mats["chrome_jewel"])
        make_cylinder(f"Atelier_Organ_Stem_{av_i+1}", (av_x, 0.50, 0.665), 0.004, 0.026, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=16)
        make_knurled_cylinder(f"Atelier_Organ_Knurl_{av_i+1}", (av_x, 0.485, 0.665), 0.007, 0.012, (math.radians(90), 0, 0), mats["anodized_gold"], ridges=16)

    # 3b. 18K Rose Gold Burmester Acoustic Tweeter Orbs & Frameless Electrochromic Mirror
    make_burmester_acoustic_tweeter_orb("Atelier_Tweeter_L", (-0.68, 0.48, 0.78), (0, math.radians(40), 0), mats, finish="rose_gold")
    make_burmester_acoustic_tweeter_orb("Atelier_Tweeter_R", (0.68, 0.48, 0.78), (0, math.radians(-40), 0), mats, finish="rose_gold")
    make_frameless_electrochromic_mirror("Atelier_Electrochromic_Mirror", (0.0, 0.46, 0.98), (0, 0, 0), mats)

    # 4. Center Console with Burl Wood, Crystal Shifter, OLED Rotary Dial, Wireless Charging, Climate Roller & Thermoelectric Cupholders
    make_box("Atelier_Center_Console", (0.0, 0.0, 0.26), (0.32, 1.15, 0.28), mats["leather_navy"], bevel=0.014)
    make_box("Atelier_Console_Burl_Deck", (0.0, 0.0, 0.405), (0.28, 1.10, 0.015), mats["wood_burl"], bevel=0.004)
    make_rotary_dial_with_oled("Atelier_Jewel_Rotary_Dial_OLED", (0.0, 0.08, 0.425), 0.042, 0.024, (0, 0, 0), mats)
    make_electronic_gear_shifter("Atelier_Crystal_Shifter", (0.0, 0.18, 0.41), (0.045, 0.075, 0.090), mats=mats, crystal=True)
    make_wireless_charging_pad("Atelier_Wireless_Pad", (0.0, -0.10, 0.418), (0.15, 0.085, 0.008), mats)
    make_climate_hvac_roller("Atelier_Rear_HVAC_Roller", (0.0, -0.56, 0.43), 0.012, 0.022, mats)
    make_thermoelectric_cup_holder("Atelier_ThermoCupholders", (0.0, 0.22, 0.405), mats=mats, finish="gold")
    make_fragrance_atomizer_flacon("Atelier_Fragrance_Flacon", (0.0, 0.02, 0.43), mats=mats)
    make_vip_airline_tray_table_and_bar("Atelier_VIP_Bar_Tray", (0.0, -0.42, 0.42), mats=mats, wood_finish="walnut", extended=False)
    make_box("Atelier_Armrest_L", (-0.07, -0.32, 0.44), (0.13, 0.36, 0.05), mats["leather_cognac"], bevel=0.010)
    make_box("Atelier_Armrest_R", (0.07, -0.32, 0.44), (0.13, 0.36, 0.05), mats["leather_cognac"], bevel=0.010)

    # Rear Champagne Decanter & Dual Crystal Flutes
    make_cylinder("Atelier_Decanter_Cradle", (0.0, -0.48, 0.44), 0.048, 0.06, (0, 0, 0), mats["metal_brushed"], vertices=28, bevel=0.002)
    make_cylinder("Atelier_Crystal_Decanter", (0.0, -0.48, 0.50), 0.042, 0.10, (0, 0, 0), mats["glass_clear"], vertices=32)
    for fl_i, fl_x in enumerate([-0.06, 0.06]):
        make_cylinder(f"Atelier_Flute_Stem_{fl_i+1}", (fl_x, -0.38, 0.46), 0.003, 0.06, (0, 0, 0), mats["glass_clear"], vertices=16)
        make_cylinder(f"Atelier_Flute_Bowl_{fl_i+1}", (fl_x, -0.38, 0.51), 0.018, 0.05, (0, 0, 0), mats["glass_clear"], vertices=24)

    # 5. Two-Tone Navy/Cognac Artisan Multi-Contour Seats with Switchgear
    for seat_name, sx in [("Driver", -0.38), ("Passenger", 0.38)]:
        make_box(f"Atelier_{seat_name}_Cushion", (sx, 0.0, 0.30), (0.46, 0.40, 0.14), mats["leather_navy"], bevel=0.016)
        make_motorized_thigh_extension_bolster(f"Atelier_{seat_name}_Thigh_Ext", (sx, 0.24, 0.30), width=0.44, depth=0.12, height=0.12, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_navy")
        make_box(f"Atelier_{seat_name}_Bolster_L", (sx - 0.22, 0.04, 0.34), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.016)
        make_box(f"Atelier_{seat_name}_Bolster_R", (sx + 0.22, 0.04, 0.34), (0.08, 0.48, 0.18), mats["leather_cognac"], bevel=0.016)
        make_box(f"Atelier_{seat_name}_Backrest", (sx, -0.16, 0.70), (0.44, 0.14, 0.62), mats["leather_navy"], bevel=0.018)
        make_box(f"Atelier_{seat_name}_Headrest", (sx, -0.14, 1.06), (0.28, 0.10, 0.16), mats["leather_navy"], bevel=0.014)
        make_box(f"Atelier_{seat_name}_Pillow", (sx, -0.09, 1.06), (0.24, 0.04, 0.12), mats["leather_cognac"], bevel=0.010)
        make_headrest_crest_medallion(f"Atelier_{seat_name}_Crest_Medallion", (sx, -0.065, 1.06), (math.radians(90), 0, 0), mats, finish="gold")
        
        at_sign = -1 if sx < 0 else 1
        at_val_x = sx + at_sign * 0.245
        make_seat_adjustment_switchpack(f"Atelier_{seat_name}_Silhouette_Switchpack", (at_val_x, 0.06, 0.28), mats=mats, finish="chrome")
        make_pill_cylinder(f"Atelier_{seat_name}_Recline_Pill", (at_val_x, 0.08, 0.26), 0.0055, 0.024, (0, math.radians(90), 0), mats["chrome_jewel"])
        make_knurled_cylinder(f"Atelier_{seat_name}_Lumbar_Knurl", (at_val_x, 0.0, 0.26), 0.011, 0.012, (0, math.radians(90), 0), mats["anodized_gold"], ridges=18)

        # ISOFIX Child Seat Safety Anchors in Seat Bight
        make_isofix_anchor_flap(f"Atelier_{seat_name}_ISOFIX_L", (sx - 0.14, -0.06, 0.25), (0.045, 0.035, 0.025), mats)
        make_isofix_anchor_flap(f"Atelier_{seat_name}_ISOFIX_R", (sx + 0.14, -0.06, 0.25), (0.045, 0.035, 0.025), mats)

        b_x = sx + (0.26 if sx < 0 else -0.26)
        make_box(f"Atelier_{seat_name}_Buckle", (b_x, -0.06, 0.32), (0.035, 0.045, 0.075), mats["leather_navy"], bevel=0.003)
        make_box(f"Atelier_{seat_name}_Buckle_Btn", (b_x, -0.06, 0.36), (0.025, 0.035, 0.012), mats["seatbelt_red_button"], bevel=0.001)
        st_sign = -1 if sx < 0 else 1
        make_box(f"Atelier_{seat_name}_Seatbelt", (sx + st_sign * 0.12, -0.08, 0.68), (0.05, 0.08, 0.65), mats["seatbelt_webbing"], bevel=0.002)

    # 6. B-Pillar Trims with Seatbelt Height Adjusters & Assist Handles
    for side, sign in [("L", -1), ("R", 1)]:
        bx = sign * 0.74
        make_box(f"Atelier_BPillar_Trim_{side}", (bx, -0.15, 0.75), (0.06, 0.14, 0.85), mats["leather_navy"], bevel=0.008)
        make_seatbelt_height_adjuster(f"Atelier_BPillar_Adjuster_{side}", (bx - sign * 0.028, -0.15, 0.86), 0.22, mats, sign=sign)
        make_b_pillar_assist_handle(f"Atelier_Assist_Handle_{side}", (bx - sign * 0.032, -0.15, 0.98), length=0.18, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_cognac", finish="gold")

    # 7. Artisan Steering Wheel (Wood & Leather) & Stalk Module
    make_steering_column_stalk_module("Atelier_Steering_Stalks", (-0.38, 0.42, 0.72), mats=mats)
    make_torus("Atelier_Steering_Rim", (-0.38, 0.36, 0.72), 0.185, 0.017, (math.radians(70), 0, 0), mats["wood_burl"])
    make_cylinder("Atelier_Steering_Boss", (-0.38, 0.38, 0.72), 0.065, 0.035, (math.radians(70), 0, 0), mats["leather_navy"], vertices=36, bevel=0.005)
    make_cylinder("Atelier_Steering_Gold_Crest", (-0.38, 0.365, 0.72), 0.028, 0.005, (math.radians(70), 0, 0), mats["anodized_gold"], vertices=32)
    make_steering_thumb_encoders_and_magnetic_paddles("Atelier_Steering_Hardware", (-0.38, 0.36, 0.72), yoke_w=0.34, yoke_h=0.22, rot_euler=(math.radians(70), 0, 0), mats=mats, stripe_color="yellow")

    # 8. Artisan Door Cards with Burl Wood Inlays, Burmester Acoustic Grilles & Articulated Latches
    for side, sign in [("L", -1), ("R", 1)]:
        dx = sign * 0.74
        make_box(f"Atelier_Door_{side}", (dx, 0.0, 0.50), (0.08, 1.10, 0.58), mats["leather_navy"], bevel=0.014)
        make_box(f"Atelier_Door_Burl_{side}", (dx - sign * 0.038, 0.0, 0.65), (0.012, 0.98, 0.065), mats["wood_burl"], bevel=0.004)
        make_box(f"Atelier_Door_Armrest_{side}", (dx - sign * 0.05, 0.05, 0.52), (0.06, 0.46, 0.06), mats["leather_cognac"], bevel=0.010)
        make_articulated_door_latch(f"Atelier_Door_Latch_{side}", (dx - sign * 0.045, 0.22, 0.56), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=side, finish="gold")
        make_high_end_acoustic_speaker_array(f"Atelier_Door_HighEnd_Acoustic_{side}", (dx - sign * 0.040, 0.28, 0.32), radius=0.075, depth=0.018, rot_euler=(0, math.radians(90 * sign), 0), mats=mats, finish="gold")
        make_seat_adjustment_switchpack(f"Atelier_Door_SeatSwitch_{side}", (dx - sign * 0.044, 0.16, 0.62), mats=mats, finish="chrome")
        make_pill_cylinder(f"Atelier_Door_Window_Switch_{side}", (dx - sign * 0.058, 0.18, 0.555), 0.005, 0.018, (0, math.radians(90), 0), mats["anodized_gold"])
        make_illuminated_door_sill_kickplate(f"Atelier_Sill_{side}", (dx, 0.05, 0.12), (0, 0, 0), mats, script_text="ATELIER 1 OF 1", gold=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("Atelier_Tourbillon_Escapement", (0.06, 0.56, 0.84), mats=mats)
    make_augmented_reality_hud_collimator("Atelier_AR_HUD_Collimator", (-0.38, 0.64, 0.84), mats=mats)
    make_steering_column_telescopic_shroud("Atelier_Steering_Shroud", (-0.38, 0.44, 0.65), mats=mats)
    make_haptic_rotary_command_dial("Atelier_Haptic_Dial", (0.0, 0.08, 0.43), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("Atelier_VIP_Refrigerated_Bar", (0.0, -0.65, 0.28), mats=mats)
    make_3d_knitted_perforated_seat_accent("Atelier_Seat_3DKnit_Driver", (-0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")
    make_3d_knitted_perforated_seat_accent("Atelier_Seat_3DKnit_Pass", (0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")

    export_active_scene_to_glb(output_path)

def build_coachbuilt_vip_salon(output_path):
    print(f"\n[BUILD] Engineering Coachbuilt VIP State Salon (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Monocoque Tub, Deep Tufted Plush Carpet & Tailored Floor Mats
    make_box("VIP_Floor_Carpet", (0.0, 0.10, 0.12), (1.52, 2.10, 0.04), mats["carpet_tufted"], bevel=0.008)
    make_tailored_floor_mat("VIP_FloorMat_Driver", (-0.38, 0.30, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony")
    make_tailored_floor_mat("VIP_FloorMat_Pass", (0.38, 0.30, 0.125), (0.46, 0.65, 0.012), mats=mats, trim_leather="leather_ebony")
    make_tailored_floor_mat("VIP_FloorMat_RearLounge", (0.0, -0.35, 0.125), (1.10, 0.70, 0.012), mats=mats, trim_leather="leather_beige")

    # 2. Executive Front Driver Cowl & Anti-Glare HUD
    make_box("VIP_Front_Dash_Cowl", (0.0, 0.70, 0.76), (1.46, 0.48, 0.10), mats["leather_ebony"], bevel=0.014)
    make_hud_glass_projector("VIP_Front_HUD", (-0.38, 0.74, 0.82), (0.22, 0.16, 0.05), mats)
    for vv_i, vv_x in enumerate([-0.62, -0.16, 0.16, 0.62]):
        make_precision_turbine_ac_vent(f"VIP_Front_Turbine_Vent_{vv_i+1}", (vv_x, 0.66, 0.74), 0.034, depth=0.024, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=8, illuminated=True, bezel_mat=mats["anodized_gold"])
    make_steering_column_stalk_module("VIP_Front_Stalks", (-0.38, 0.52, 0.72), mats=mats)
    make_electronic_gear_shifter("VIP_Front_Shifter", (0.0, 0.26, 0.38), (0.045, 0.075, 0.090), mats=mats, crystal=True)
    make_frameless_electrochromic_mirror("VIP_Electrochromic_Mirror", (0.0, 0.55, 0.98), (0, 0, 0), mats)
    make_burmester_acoustic_tweeter_orb("VIP_Tweeter_L", (-0.68, 0.60, 0.80), (0, math.radians(40), 0), mats, finish="gold")
    make_burmester_acoustic_tweeter_orb("VIP_Tweeter_R", (0.68, 0.60, 0.80), (0, math.radians(-40), 0), mats, finish="gold")

    # 3. State Limousine Partition Bulkhead with Electrochromic Glass & Acoustic Sound Grilles
    make_box("VIP_Partition_Bulkhead_Lower", (0.0, 0.12, 0.55), (1.48, 0.08, 0.85), mats["wood_walnut"], bevel=0.012)
    make_box("VIP_Partition_Smart_Glass", (0.0, 0.12, 1.16), (1.42, 0.02, 0.36), mats["glass_clear"], bevel=0.004)
    make_box("VIP_Partition_Chrome_Frame", (0.0, 0.12, 1.16), (1.44, 0.025, 0.38), mats["chrome_jewel"], bevel=0.003)
    for pb_x in [-0.68, -0.24, 0.24, 0.68]:
        make_hex_bolt(f"VIP_Partition_Hex_{pb_x}", (pb_x, 0.12, 0.98), 0.006, 0.008, (math.radians(90), 0, 0), mats["titanium_finish"])
    make_high_end_acoustic_speaker_array("VIP_Partition_Acoustic_Array_L", (-0.48, 0.12, 0.42), radius=0.080, depth=0.018, rot_euler=(math.radians(90), 0, 0), mats=mats, finish="gold")
    make_high_end_acoustic_speaker_array("VIP_Partition_Acoustic_Array_R", (0.48, 0.12, 0.42), radius=0.080, depth=0.018, rot_euler=(math.radians(90), 0, 0), mats=mats, finish="gold")

    # Swiss Bulkhead Analog Clock with Diamond-Knurled Bezel
    make_cylinder("VIP_Bulkhead_Clock_Bezel", (0.0, 0.075, 0.92), 0.042, 0.018, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=40, bevel=0.002)
    make_knurled_cylinder("VIP_Bulkhead_Clock_Knurled_Rim", (0.0, 0.072, 0.92), 0.045, 0.010, (math.radians(90), 0, 0), mats["chrome_jewel"], ridges=36)
    make_cylinder("VIP_Bulkhead_Clock_Dial", (0.0, 0.065, 0.92), 0.035, 0.004, (math.radians(90), 0, 0), mats["wood_pianoblack"], vertices=40)
    make_box("VIP_Bulkhead_Clock_Hands", (0.0, 0.060, 0.92), (0.014, 0.002, 0.014), mats["anodized_gold"], bevel=0)

    # 4. Ultra-Wide 43-Inch Panoramic Cinema OLED Display
    make_box("VIP_Cinema_Display_Housing", (0.0, 0.09, 1.12), (1.14, 0.04, 0.48), mats["wood_pianoblack"], bevel=0.006)
    make_box("VIP_Cinema_Active_Screen", (0.0, 0.068, 1.12), (1.08, 0.006, 0.44), mats["screen_oled"], bevel=0.002)

    # 5. Dual First-Class Zero-Gravity Sleeper Seats with Calf Rest Ottomans & Fold-Out Tables
    for s_name, sx in [("L", -0.38), ("R", 0.38)]:
        make_box(f"VIP_Sleeper_Cushion_{s_name}", (sx, -0.45, 0.32), (0.50, 0.54, 0.16), mats["leather_beige"], bevel=0.018)
        make_box(f"VIP_Calf_Rest_Ottoman_{s_name}", (sx, -0.12, 0.28), (0.46, 0.32, 0.12), mats["leather_beige"], bevel=0.014)
        make_box(f"VIP_Sleeper_Backrest_{s_name}", (sx, -0.74, 0.72), (0.48, 0.16, 0.65), mats["leather_beige"], bevel=0.018)
        make_box(f"VIP_Memory_Headrest_{s_name}", (sx, -0.70, 1.08), (0.28, 0.08, 0.16), mats["leather_cognac"], bevel=0.012)
        make_headrest_crest_medallion(f"VIP_Memory_Headrest_Crest_{s_name}", (sx, -0.655, 1.08), (math.radians(90), 0, 0), mats, finish="gold")
        
        # Tactile pill rockers, seat silhouette switchpack, climate HVAC roller and knurled massage dial on outer armrest
        vip_sign = -1 if sx < 0 else 1
        vip_ctrl_x = sx + vip_sign * 0.26
        make_seat_adjustment_switchpack(f"VIP_SeatSwitch_{s_name}", (vip_ctrl_x, -0.24, 0.44), mats=mats, finish="chrome")
        make_pill_cylinder(f"VIP_Recline_Rocker_{s_name}", (vip_ctrl_x, -0.40, 0.42), 0.006, 0.026, (0, math.radians(90), 0), mats["chrome_jewel"])
        make_knurled_cylinder(f"VIP_Massage_Knurl_{s_name}", (vip_ctrl_x, -0.48, 0.42), 0.012, 0.014, (0, math.radians(90), 0), mats["anodized_gold"], ridges=20)
        make_climate_hvac_roller(f"VIP_HVAC_Roller_{s_name}", (vip_ctrl_x, -0.32, 0.42), 0.012, 0.022, mats)

        # ISOFIX Child Seat Safety Anchors in VIP Seat Bight
        make_isofix_anchor_flap(f"VIP_ISOFIX_L_{s_name}", (sx - 0.14, -0.66, 0.28), (0.045, 0.035, 0.025), mats)
        make_isofix_anchor_flap(f"VIP_ISOFIX_R_{s_name}", (sx + 0.14, -0.66, 0.28), (0.045, 0.035, 0.025), mats)
        
        make_box(f"VIP_Writing_Table_{s_name}", (sx, -0.15, 0.64), (0.42, 0.28, 0.018), mats["wood_walnut"], bevel=0.004)
        make_cylinder(f"VIP_Table_Articulated_Arm_{s_name}", (sx - 0.20, -0.15, 0.58), 0.008, 0.14, (0, 0, 0), mats["chrome_jewel"], vertices=16)
        make_hex_bolt(f"VIP_Table_Hinge_Hex_{s_name}", (sx - 0.20, -0.15, 0.65), 0.006, 0.006, (0, 0, 0), mats["titanium_finish"])

    # 5b. B-Pillar Seatbelt Height Adjusters, VIP Articulated Latches & French-Seamed Assist Handles
    for v_side, v_sign in [("L", -1), ("R", 1)]:
        make_seatbelt_height_adjuster(f"VIP_BPillar_Adjuster_{v_side}", (v_sign * 0.72, -0.15, 0.86), 0.22, mats, sign=v_sign)
        make_articulated_door_latch(f"VIP_Door_Latch_{v_side}", (v_sign * 0.70, -0.30, 0.52), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=v_side, finish="gold")
        make_b_pillar_assist_handle(f"VIP_Assist_Handle_{v_side}", (v_sign * 0.71, -0.15, 0.98), length=0.18, rot_euler=(0, 0, 0), mats=mats, leather_mat="leather_beige", finish="gold")

    # 6. Central VIP Credenza with Illuminated Champagne Chiller, OLED Dial, Wireless Charging & Thermoelectric Dual-Zone Cupholders
    make_box("VIP_Center_Credenza", (0.0, -0.48, 0.36), (0.24, 0.75, 0.32), mats["wood_walnut"], bevel=0.012)
    make_wireless_charging_pad("VIP_Credenza_Wireless_Charger", (0.0, -0.68, 0.49), (0.15, 0.085, 0.008), mats)
    make_cylinder("VIP_Champagne_Chiller_Well", (0.0, -0.35, 0.48), 0.055, 0.12, (0, 0, 0), mats["metal_brushed"], vertices=32, bevel=0.003)
    make_knurled_cylinder("VIP_Chiller_Knurled_Collar", (0.0, -0.35, 0.54), 0.058, 0.012, (0, 0, 0), mats["chrome_jewel"], ridges=32)
    make_rotary_dial_with_oled("VIP_Credenza_OLED_Dial", (0.0, -0.48, 0.52), 0.042, 0.020, (0, 0, 0), mats)
    make_box("VIP_Master_Command_Touchscreen", (0.0, -0.58, 0.48), (0.16, 0.10, 0.012), mats["screen_oled"], bevel=0.002)
    make_thermoelectric_cup_holder("VIP_Salon_ThermoCupholders", (0.0, -0.32, 0.49), mats=mats, finish="gold")
    make_vip_airline_tray_table_and_bar("VIP_Salon_Bar_Tray", (0.0, -0.38, 0.46), mats=mats, wood_finish="walnut", extended=False)
    make_fragrance_atomizer_flacon("VIP_Fragrance_Flacon", (0.0, 0.18, 0.40), mats=mats)
    for fl_x in [-0.06, 0.06]:
        make_cylinder(f"VIP_Crystal_Flute_Stem_{'L' if fl_x < 0 else 'R'}", (fl_x, -0.22, 0.52), 0.004, 0.08, (0, 0, 0), mats["glass_clear"], vertices=16)
        make_cylinder(f"VIP_Crystal_Flute_Bowl_{'L' if fl_x < 0 else 'R'}", (fl_x, -0.22, 0.58), 0.022, 0.06, (0, 0, 0), mats["glass_clear"], vertices=24)

    # 7. State Limousine Gold Door Sill Kickplates
    make_illuminated_door_sill_kickplate("VIP_Sill_L", (-0.72, -0.15, 0.12), (0, 0, 0), mats, script_text="STATE LIMOUSINE", gold=True)
    make_illuminated_door_sill_kickplate("VIP_Sill_R", (0.72, -0.15, 0.12), (0, 0, 0), mats, script_text="STATE LIMOUSINE", gold=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("VIP_Salon_Tourbillon", (0.0, 0.075, 0.94), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("VIP_Salon_Refrigerated_Bar", (0.0, -0.60, 0.28), mats=mats)
    make_haptic_rotary_command_dial("VIP_Salon_Haptic_Dial", (0.0, -0.48, 0.53), mats=mats)
    make_3d_knitted_perforated_seat_accent("VIP_Sleeper_3DKnit_L", (-0.38, -0.45, 0.40), size=(0.36, 0.42, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")
    make_3d_knitted_perforated_seat_accent("VIP_Sleeper_3DKnit_R", (0.38, -0.45, 0.40), size=(0.36, 0.42, 0.015), mats=mats, accent_mat="leather_semi_aniline_saddle")

    export_active_scene_to_glb(output_path)

def build_endurance_gt3_cockpit(output_path):
    print(f"\n[BUILD] Engineering 24-Hour Endurance GT3 Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. FIA Full Tubular Roll Cage Structure (Chrome-moly steel) with Grade 12.9 Fasteners & SFI Padding
    cage_r = 0.022
    make_cylinder("Endurance_Cage_MainHoop_L", (-0.68, -0.15, 0.75), cage_r, 1.20, (0, 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Endurance_Cage_MainHoop_R", (0.68, -0.15, 0.75), cage_r, 1.20, (0, 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Endurance_Cage_CrossBar_Top", (0.0, -0.15, 1.34), cage_r, 1.36, (0, math.radians(90), 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Endurance_Cage_Diagonal", (0.0, -0.15, 0.75), cage_r, 1.62, (0, math.radians(52), 0), mats["metal_brushed"], vertices=24)
    # Motorsport Gusset Reinforcement Plates with Flared Lightening Holes
    make_gusset_bracket("Endurance_Cage_Gusset_TL", (-0.60, -0.15, 1.26), (0.12, 0.012, 0.12), 0.022, (0, 0, 0), mats["titanium_finish"])
    make_gusset_bracket("Endurance_Cage_Gusset_TR", (0.60, -0.15, 1.26), (0.12, 0.012, 0.12), 0.022, (0, 0, 0), mats["titanium_finish"])
    make_cylinder("Endurance_Cage_A_Pillar_L", (-0.68, 0.35, 0.75), cage_r, 1.15, (math.radians(-32), 0, 0), mats["metal_brushed"], vertices=24)
    make_cylinder("Endurance_Cage_A_Pillar_R", (0.68, 0.35, 0.75), cage_r, 1.15, (math.radians(-32), 0, 0), mats["metal_brushed"], vertices=24)

    # High-impact SFI 45.1 roll cage padding on critical contact surfaces
    make_rollcage_impact_padding("Endurance_Padding_A_Pillar_L", (-0.68, 0.35, 0.85), length=0.35, radius=0.026, rot_euler=(math.radians(-32), 0, 0), mats=mats)
    make_rollcage_impact_padding("Endurance_Padding_A_Pillar_R", (0.68, 0.35, 0.85), length=0.35, radius=0.026, rot_euler=(math.radians(-32), 0, 0), mats=mats)
    make_rollcage_impact_padding("Endurance_Padding_CrossBar_Top", (0.0, -0.15, 1.34), length=0.45, radius=0.026, rot_euler=(0, math.radians(90), 0), mats=mats)

    # Roll cage Grade 12.9 titanium junction bolts
    for ec_x in [-0.68, 0.68]:
        make_hex_bolt(f"Endurance_Cage_Bolt_F_{ec_x}", (ec_x, 0.35, 0.18), 0.008, 0.008, (0, 0, 0), mats["titanium_finish"])
        make_hex_bolt(f"Endurance_Cage_Bolt_R_{ec_x}", (ec_x, -0.15, 0.16), 0.008, 0.008, (0, 0, 0), mats["titanium_finish"])

    # 1b. FIA Competition Window Safety Net (High-Tensile Royal Blue Webbing & Quick Release)
    make_motorsport_window_safety_net("Endurance_Safety_Net", (-0.68, 0.10, 0.88), (0.015, 0.54, 0.42), (0, 0, 0), mats, webbing_mat="safety_webbing_blue")

    # Overhead Night-Racing Ambient Red Flood Lamps
    for flood_x in [-0.25, 0.25]:
        make_box(f"Endurance_Night_Flood_Housing_{'L' if flood_x < 0 else 'R'}", (flood_x, -0.15, 1.31), (0.05, 0.04, 0.025), mats["titanium_finish"], bevel=0.002)
        make_box(f"Endurance_Night_Flood_Lens_{'L' if flood_x < 0 else 'R'}", (flood_x, -0.15, 1.295), (0.04, 0.03, 0.005), mats["anodized_red"], bevel=0)

    # 2. Textured Floor Grip Tape Runner Strips
    for strip_i in range(3):
        make_box(f"Endurance_Floor_Grip_{strip_i+1}", (-0.38, 0.20 + strip_i * 0.12, 0.105), (0.28, 0.08, 0.004), mats["rubber_traction"], bevel=0)

    # 3. Carbon Dash Cowl, Dual Defogging Fans, HUD & Co-Driver Rally Trip Computer
    make_box("Endurance_Dash_Carbon", (0.0, 0.55, 0.74), (1.40, 0.50, 0.08), mats["carbon_twill"], bevel=0.012)
    make_box("Endurance_Telemetry_Cluster", (-0.36, 0.52, 0.76), (0.38, 0.015, 0.14), mats["screen_oled"], bevel=0.002)
    make_hud_glass_projector("Endurance_HUD", (-0.36, 0.58, 0.79), (0.20, 0.15, 0.045), mats)
    make_box("Endurance_TripComputer", (0.34, 0.52, 0.74), (0.16, 0.06, 0.10), mats["titanium_finish"], bevel=0.003)
    make_box("Endurance_TripComputer_Screen", (0.34, 0.488, 0.74), (0.13, 0.005, 0.07), mats["screen_oled"], bevel=0.001)
    for ev_i, ev_x in enumerate([-0.58, 0.58]):
        make_precision_turbine_ac_vent(f"Endurance_Turbine_Vent_{ev_i+1}", (ev_x, 0.52, 0.72), 0.032, depth=0.022, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=6, illuminated=False, bezel_mat=mats["titanium_finish"], core_mat=mats["billet_aluminum"])

    for fan_x in [-0.20, 0.20]:
        make_cylinder(f"Endurance_Defog_Fan_Housing_{'L' if fan_x < 0 else 'R'}", (fan_x, 0.65, 0.79), 0.038, 0.035, (math.radians(25), 0, 0), mats["metal_brushed"], vertices=28, bevel=0.002)
        make_box(f"Endurance_Defog_Fan_Grille_{'L' if fan_x < 0 else 'R'}", (fan_x, 0.64, 0.81), (0.05, 0.01, 0.05), mats["titanium_finish"], bevel=0)
    make_box("Endurance_HD_Rearview_Camera_Display", (0.0, 0.45, 1.02), (0.18, 0.015, 0.08), mats["screen_oled"], bevel=0.002)
    make_cylinder("Endurance_Camera_Display_Mount", (0.0, 0.45, 1.08), 0.008, 0.08, (0, 0, 0), mats["metal_brushed"], vertices=16)

    # 4. Center Console: Exposed Horological Shifter, Start/Stop Flip Guard, Swivel Blower, MoTeC ECU, Cool-Suit & LifeLine Fire Suppression
    make_box("Endurance_Console_Carbon", (0.0, 0.0, 0.24), (0.28, 1.05, 0.28), mats["carbon_twill"], bevel=0.012)
    make_aircraft_toggle_switch_bank("Endurance_ToggleBank", (0.0, 0.38, 0.36), switch_count=4, rot_euler=(math.radians(25), 0, 0), mats=mats, carbon_plate=True)
    make_start_stop_button_with_flip_cover("Endurance_StartStop_FlipGuard", (0.0, 0.18, 0.31), 0.024, mats)
    make_exposed_horological_shifter_linkage("Endurance_Exposed_Shifter", (0.0, 0.05, 0.28), size=(0.14, 0.20, 0.12), mats=mats, gold=True, gear=3)
    make_cylinder("Endurance_Cockpit_Blower_Base", (0.09, -0.16, 0.32), 0.020, 0.015, (0, 0, 0), mats["titanium_finish"], vertices=24)
    make_cylinder("Endurance_Cockpit_Blower_Nozzle", (0.09, -0.16, 0.34), 0.016, 0.030, (math.radians(-30), 0, 0), mats["billet_aluminum"], vertices=24)
    make_cylinder("Endurance_Ebrake_Lever", (0.07, -0.06, 0.46), 0.014, 0.32, (math.radians(-15), 0, 0), mats["anodized_red"], vertices=24, bevel=0.003)
    make_fire_suppression_system("Endurance_Fire_Suppression", (0.38, 0.15, 0.22), size=(0.11, 0.32, 0.11), rot_euler=(0, math.radians(90), 0), mats=mats)
    
    # MoTeC ECU with 4x Grade 12.9 hex screws
    make_box("Endurance_MoTeC_ECU", (-0.06, -0.22, 0.285), (0.075, 0.09, 0.025), mats["titanium_finish"], bevel=0.003)
    for mx in [-0.085, -0.035]:
        for my in [-0.255, -0.185]:
            make_hex_bolt(f"Endurance_MoTeC_Hex_{mx}_{my}", (mx, my, 0.30), 0.0035, 0.004, (0, 0, 0), mats["titanium_finish"])

    # Driver Cool-Suit Dual Quick-Disconnect Ports with Diamond-Knurled Couplers & Blue Insulated Hoses
    for cs_i, cs_x in enumerate([-0.05, 0.05]):
        make_cylinder(f"Endurance_Coolsuit_Port_{cs_i+1}", (cs_x, 0.24, 0.315), 0.012, 0.020, (0, 0, 0), mats["chrome_jewel"], vertices=20, bevel=0.002)
        make_knurled_cylinder(f"Endurance_Coolsuit_Knurl_{cs_i+1}", (cs_x, 0.24, 0.328), 0.014, 0.008, (0, 0, 0), mats["billet_aluminum"], ridges=18)
        make_cylinder(f"Endurance_Coolsuit_Hose_{cs_i+1}", (cs_x, 0.24, 0.355), 0.008, 0.045, (math.radians(20), 0, 0), mats["coolsuit_blue"], vertices=16)

    # 5. Carbon Racing Bucket Seat with FIA 6-Point Harness & Floor Mounting Bolts
    make_box("Endurance_Seat_Shell", (-0.38, -0.10, 0.68), (0.48, 0.52, 0.86), mats["carbon_twill"], bevel=0.016)
    make_box("Endurance_Seat_Cushion", (-0.38, 0.05, 0.30), (0.38, 0.40, 0.06), mats["alcantara_charcoal"], bevel=0.010)
    make_box("Endurance_Harness_L", (-0.46, -0.05, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_box("Endurance_Harness_R", (-0.30, -0.05, 0.78), (0.055, 0.16, 0.32), mats["harness_red"], bevel=0.002)
    make_cylinder("Endurance_Camlock_Buckle", (-0.38, 0.03, 0.38), 0.035, 0.024, (math.radians(35), 0, 0), mats["metal_brushed"], vertices=28, bevel=0.002)
    make_racing_harness_system("Endurance_Driver_FIA_Harness", (-0.38, -0.06, 0.30), mats=mats, color="red")
    for es_x in [-0.58, -0.18]:
        for es_y in [-0.28, 0.15]:
            make_hex_bolt(f"Endurance_Seat_Hex_{es_x}_{es_y}", (es_x, es_y, 0.14), 0.007, 0.006, (0, 0, 0), mats["titanium_finish"])

    # 6. Formula Racing Yoke with Stalks, Coiled Telemetry Cord, Knurled Encoders & Magnetic Paddles
    make_steering_column_stalk_module("Endurance_Steering_Stalks", (-0.38, 0.40, 0.72), mats=mats, stalk_length=0.11)
    make_box("Endurance_Yoke_Plate", (-0.38, 0.34, 0.72), (0.28, 0.025, 0.18), mats["carbon_twill"], bevel=0.006)
    make_paddle_micro_switch("Endurance_Paddle_Switch_L", (-0.46, 0.36, 0.72), (0.012, 0.016, 0.018), mats)
    make_paddle_micro_switch("Endurance_Paddle_Switch_R", (-0.30, 0.36, 0.72), (0.012, 0.016, 0.018), mats)
    make_cylinder("Endurance_Yoke_Grip_L", (-0.51, 0.34, 0.72), 0.022, 0.16, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.003)
    make_cylinder("Endurance_Yoke_Grip_R", (-0.25, 0.34, 0.72), 0.022, 0.16, (0, 0, 0), mats["alcantara_charcoal"], vertices=24, bevel=0.003)
    make_knurled_cylinder("Endurance_Yoke_Engine_Map", (-0.43, 0.325, 0.69), 0.011, 0.012, (math.radians(70), 0, 0), mats["anodized_gold"], ridges=16)
    make_knurled_cylinder("Endurance_Yoke_Brake_Bias", (-0.33, 0.325, 0.69), 0.011, 0.012, (math.radians(70), 0, 0), mats["anodized_red"], ridges=16)
    make_cylinder("Endurance_Coiled_Cable", (-0.38, 0.38, 0.69), 0.012, 0.08, (math.radians(70), 0, 0), mats["rubber_traction"], vertices=16)
    make_cylinder("Endurance_Drink_Bite_Valve", (-0.30, 0.36, 0.76), 0.006, 0.035, (0, 0, 0), mats["ambient_iceblue"], vertices=12)
    make_steering_thumb_encoders_and_magnetic_paddles("Endurance_Yoke_Hardware", (-0.38, 0.34, 0.72), yoke_w=0.30, yoke_h=0.18, rot_euler=(0, 0, 0), mats=mats, stripe_color="yellow")

    # 7. Competition Floor Pedals with 3D Helical Return Spring & CNC Billet Dead Pedal Footrest
    make_dead_pedal_footrest("Endurance_DeadPedal", (-0.52, 0.62, 0.16), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)
    make_box("Endurance_BrakePedal", (-0.38, 0.58, 0.20), (0.075, 0.10, 0.025), mats["metal_brushed"], bevel=0.002)
    make_spring_coil("Endurance_Brake_Spring", (-0.38, 0.64, 0.23), 0.012, 0.006, 5, 0.002, (math.radians(-90), 0, 0), mats["anodized_red"])
    make_pedal_pushrod_linkage("Endurance_Pedal_Pushrod_Brake", (-0.38, 0.60, 0.20), mats=mats)
    make_pedal_pushrod_linkage("Endurance_Pedal_Pushrod_Clutch", (-0.46, 0.60, 0.20), mats=mats)
    make_box("Endurance_GasPedal", (-0.24, 0.56, 0.18), (0.055, 0.18, 0.022), mats["metal_brushed"], bevel=0.002)

    # 8. Forged Carbon Competition Door Sill Kickplates
    make_illuminated_door_sill_kickplate("Endurance_Sill_L", (-0.70, 0.05, 0.12), (0, 0, 0), mats, script_text="COMPETITION GT", carbon=True)
    make_illuminated_door_sill_kickplate("Endurance_Sill_R", (0.70, 0.05, 0.12), (0, 0, 0), mats, script_text="COMPETITION GT", carbon=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_hydraulic_handbrake_assembly("Endurance_Hydraulic_Handbrake", (0.07, -0.06, 0.30), mats=mats, finish="anodized_red")
    make_footwell_night_navigation_gooseneck("Endurance_Nav_Gooseneck", (-0.11, 0.35, 0.28), mats=mats)
    make_steering_column_telescopic_shroud("Endurance_Telescopic_Shroud", (-0.38, 0.40, 0.65), mats=mats)
    make_augmented_reality_hud_collimator("Endurance_AR_HUD", (-0.36, 0.58, 0.80), mats=mats)
    make_3d_knitted_perforated_seat_accent("Endurance_Driver_3DKnit", (-0.38, 0.05, 0.335), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_red")

    export_active_scene_to_glb(output_path)

def build_hypercar_carbon_cockpit(output_path):
    print(f"\n[BUILD] Engineering Hypercar Forged Carbon Monocoque Cockpit (v7.0 Class-A Master CAD) -> {output_path}")
    mats = reset_scene_and_get_mats()

    # 1. Aerodynamic Teardrop Monocoque Tub in Satin Forged Carbon Fiber
    make_box("Hyper_Forged_Carbon_Tub", (0.0, 0.10, 0.30), (1.44, 1.90, 0.45), mats["carbon_forged"], bevel=0.020)

    # Dihedral Door Structural Sill Beams with Serial Plaque, Titanium Screws & Latches
    for sill_x, s_name in [(-0.68, "L"), (0.68, "R")]:
        make_box(f"Hyper_Dihedral_Sill_{s_name}", (sill_x, 0.05, 0.32), (0.14, 1.45, 0.18), mats["carbon_forged"], bevel=0.014)
        make_articulated_door_latch(f"Hyper_Dihedral_Latch_{s_name}", (sill_x + (0.06 if s_name == "L" else -0.06), 0.16, 0.48), (0.11, 0.035, 0.055), (0, 0, 0), mats=mats, side=s_name, finish="titanium")
    make_box("Hyper_Chassis_Serial_Plaque", (-0.68, 0.10, 0.42), (0.08, 0.04, 0.004), mats["brass_brushed"], bevel=0.001)
    for sp_x in [-0.71, -0.65]:
        for sp_y in [0.085, 0.115]:
            make_hex_bolt(f"Hyper_Plaque_Screw_{sp_x}_{sp_y}", (sp_x, sp_y, 0.424), 0.0025, 0.002, (0, 0, 0), mats["titanium_finish"])

    # 1b. Dihedral Sills Integrated Acoustic Sound Grilles
    for hs_name, hs_sign in [("L", -1), ("R", 1)]:
        make_high_end_acoustic_speaker_array(f"Hyper_Sill_Speaker_{hs_name}", (hs_sign * 0.62, 0.28, 0.32), radius=0.068, depth=0.016, rot_euler=(0, math.radians(90 * hs_sign), 0), mats=mats, finish="titanium")

    # 2. Cantilevered Carbon Center Spine with Start/Stop Cover, Exposed Horological Shifter, OLED Mode Dial, Wireless Charging & Aircraft Toggles
    make_box("Hyper_Cantilever_Spine", (0.0, 0.05, 0.28), (0.22, 1.05, 0.08), mats["carbon_forged"], bevel=0.010)
    make_aircraft_toggle_switch_bank("Hyper_Carbon_Toggles", (0.0, 0.36, 0.35), switch_count=3, rot_euler=(math.radians(30), 0, 0), mats=mats, carbon_plate=True)
    make_start_stop_button_with_flip_cover("Hyper_StartStop_FlipGuard", (0.0, 0.28, 0.33), 0.022, mats)
    make_exposed_horological_shifter_linkage("Hyper_Exposed_Shifter", (0.0, 0.02, 0.33), size=(0.12, 0.18, 0.10), mats=mats, gold=False, gear=3)
    make_box("Hyper_Capacitive_Glass_Selector", (0.0, 0.12, 0.325), (0.14, 0.24, 0.008), mats["wood_pianoblack"], bevel=0.002)
    make_rotary_dial_with_oled("Hyper_Spine_OLED_Dial", (0.0, -0.05, 0.335), 0.038, 0.022, (0, 0, 0), mats)
    make_wireless_charging_pad("Hyper_Wireless_Pad", (0.0, -0.16, 0.33), (0.15, 0.085, 0.008), mats)
    make_fire_suppression_system("Hyper_Fire_Suppression", (0.38, 0.15, 0.22), size=(0.10, 0.30, 0.10), rot_euler=(0, math.radians(90), 0), mats=mats)
    make_deployable_cupholder("Hyper_Deployable_Cupholder", (0.0, 0.20, 0.30), 0.036, 0.040, mats)

    # 3. Minimalist Carbon Aerofoil Dashboard, OLED Displays, HUD & Turbine Vents
    make_box("Hyper_Dash_Carbon_Blade", (0.0, 0.54, 0.74), (1.44, 0.36, 0.07), mats["carbon_forged"], bevel=0.010)
    make_box("Hyper_Driver_OLED_Cluster", (-0.38, 0.50, 0.76), (0.40, 0.012, 0.16), mats["screen_oled"], bevel=0.002)
    make_center_telemetry = make_box("Hyper_Center_Telemetry_OLED", (0.04, 0.48, 0.74), (0.38, 0.014, 0.18), mats["screen_oled"], bevel=0.002)
    make_box("Hyper_Dash_Ambient_Ribbon", (0.0, 0.48, 0.68), (1.40, 0.006, 0.006), mats["ambient_iceblue"], bevel=0)
    make_hud_glass_projector("Hyper_HUD", (-0.38, 0.56, 0.79), (0.20, 0.15, 0.045), mats)
    make_frameless_electrochromic_mirror("Hyper_Electrochromic_Mirror", (0.0, 0.44, 0.98), (0, 0, 0), mats)
    for hyv_i, hyv_x in enumerate([-0.62, 0.32]):
        make_precision_turbine_ac_vent(f"Hyper_Turbine_Vent_{hyv_i+1}", (hyv_x, 0.51, 0.72), 0.030, depth=0.020, rot_euler=(math.radians(90), 0, 0), mats=mats, vane_count=6, illuminated=True, bezel_mat=mats["titanium_finish"], core_mat=mats["carbon_twill"])

    # 4. Integrated Carbon Monocoque Race Seat Shells with FIA 6-Point Harness & Floor Titanium Bolts
    for seat_name, sx in [("Driver", -0.38), ("Passenger", 0.38)]:
        make_box(f"Hyper_Seat_Shell_{seat_name}", (sx, -0.10, 0.66), (0.46, 0.52, 0.85), mats["carbon_twill"], bevel=0.016)
        make_box(f"Hyper_Seat_Base_Pad_{seat_name}", (sx, 0.02, 0.28), (0.38, 0.42, 0.07), mats["alcantara_charcoal"], bevel=0.010)
        make_box(f"Hyper_Seat_Back_Pad_{seat_name}", (sx, -0.14, 0.70), (0.36, 0.06, 0.58), mats["alcantara_charcoal"], bevel=0.010)
        make_box(f"Hyper_Harness_L_{seat_name}", (sx - 0.08, -0.05, 0.78), (0.05, 0.16, 0.32), mats["harness_red"], bevel=0.002)
        make_box(f"Hyper_Harness_R_{seat_name}", (sx + 0.08, -0.05, 0.78), (0.05, 0.16, 0.32), mats["harness_red"], bevel=0.002)
        make_cylinder(f"Hyper_Camlock_{seat_name}", (sx, 0.02, 0.36), 0.035, 0.024, (math.radians(35), 0, 0), mats["metal_brushed"], vertices=28, bevel=0.002)
        make_racing_harness_system(f"Hyper_{seat_name}_FIA_Harness", (sx, -0.06, 0.30), mats=mats, color="red")
        for hsb_x in [-0.18, 0.18]:
            for hsb_y in [-0.26, 0.14]:
                make_hex_bolt(f"Hyper_Seat_Hex_{seat_name}_{hsb_x}_{hsb_y}", (sx + hsb_x, hsb_y, 0.13), 0.006, 0.006, (0, 0, 0), mats["titanium_finish"])

    # 5. Formula Carbon Yoke & Steering Column with Stalk Module, Knurled Encoders & Magnetic Paddles
    make_steering_column_stalk_module("Hyper_Steering_Stalks", (-0.38, 0.38, 0.72), mats=mats, stalk_length=0.11)
    make_box("Hyper_Yoke_Center", (-0.38, 0.32, 0.72), (0.26, 0.022, 0.16), mats["carbon_twill"], bevel=0.006)
    make_paddle_micro_switch("Hyper_Paddle_Switch_L", (-0.45, 0.34, 0.72), (0.012, 0.016, 0.018), mats)
    make_paddle_micro_switch("Hyper_Paddle_Switch_R", (-0.31, 0.34, 0.72), (0.012, 0.016, 0.018), mats)
    make_cylinder("Hyper_Yoke_Grip_L", (-0.50, 0.32, 0.72), 0.022, 0.15, (0, 0, 0), mats["rubber_traction"], vertices=24, bevel=0.003)
    make_cylinder("Hyper_Yoke_Grip_R", (-0.26, 0.32, 0.72), 0.022, 0.15, (0, 0, 0), mats["rubber_traction"], vertices=24, bevel=0.003)
    make_knurled_cylinder("Hyper_Yoke_Scroll_L", (-0.44, 0.32, 0.72), 0.008, 0.014, (math.radians(70), 0, 0), mats["metal_brushed"], ridges=16)
    make_knurled_cylinder("Hyper_Yoke_Scroll_R", (-0.32, 0.32, 0.72), 0.008, 0.014, (math.radians(70), 0, 0), mats["metal_brushed"], ridges=16)
    make_steering_thumb_encoders_and_magnetic_paddles("Hyper_Yoke_Hardware", (-0.38, 0.32, 0.72), yoke_w=0.28, yoke_h=0.18, rot_euler=(0, 0, 0), mats=mats, stripe_color="yellow")

    # 6. Titanium Floor Pedals & CNC Billet Dead Pedal Footrest
    make_dead_pedal_footrest("Hyper_DeadPedal", (-0.48, 0.54, 0.20), (0.095, 0.230, 0.038), rot_euler=(math.radians(45), 0, 0), mats=mats)
    make_box("Hyper_BrakePedal", (-0.38, 0.56, 0.18), (0.075, 0.10, 0.022), mats["titanium_finish"], bevel=0.002)
    make_pedal_pushrod_linkage("Hyper_Pedal_Pushrod", (-0.38, 0.58, 0.18), mats=mats)
    make_box("Hyper_GasPedal", (-0.24, 0.54, 0.16), (0.055, 0.18, 0.020), mats["titanium_finish"], bevel=0.002)

    # 7. Forged Carbon Monocoque Illuminated Sill Kickplates
    make_illuminated_door_sill_kickplate("Hyper_Sill_L", (-0.68, 0.05, 0.12), (0, 0, 0), mats, script_text="CARBON MONOCOQUE", carbon=True)
    make_illuminated_door_sill_kickplate("Hyper_Sill_R", (0.68, 0.05, 0.12), (0, 0, 0), mats, script_text="CARBON MONOCOQUE", carbon=True)

    # v13.0 Ultimate Craftsmanship Additions
    make_hydraulic_handbrake_assembly("Hyper_Hydraulic_Handbrake", (0.08, -0.02, 0.34), mats=mats, finish="anodized_red")
    make_footwell_night_navigation_gooseneck("Hyper_Nav_Gooseneck", (-0.18, 0.32, 0.28), mats=mats)
    make_augmented_reality_hud_collimator("Hyper_AR_HUD_Collimator", (-0.38, 0.56, 0.81), mats=mats)
    make_steering_column_telescopic_shroud("Hyper_Telescopic_Shroud", (-0.38, 0.38, 0.65), mats=mats)
    make_3d_knitted_perforated_seat_accent("Hyper_Seat_3DKnit_Driver", (-0.38, 0.02, 0.315), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_petrol_blue")
    make_3d_knitted_perforated_seat_accent("Hyper_Seat_3DKnit_Pass", (0.38, 0.02, 0.315), size=(0.30, 0.34, 0.012), mats=mats, accent_mat="anodized_petrol_blue")

    export_active_scene_to_glb(output_path)

# ==============================================================================
# 9. MASTER COMPILER ORCHESTRATION ACROSS ALL 29 ASSETS
# ==============================================================================
def main():
    print("=" * 80)
    print("STARTING AUTOMOTIVE INTERIOR DETAIL ENHANCEMENT SUITE v13.0 ULTIMATE HAUTE HORLOGERIE & AEROSPACE CRAFTSMANSHIP INTERIOR TIER VIA BLENDER 5.2")
    print("=" * 80)

    # 1. Standalone Dashboards (5 files)
    build_executive_dashboard(os.path.join(INTERIOR_DIR, "dashboard_executive.glb"))
    build_sport_dashboard(os.path.join(INTERIOR_DIR, "dashboard_sport.glb"))
    build_hyper_glass_dashboard(os.path.join(INTERIOR_DIR, "dashboard_hyper_glass.glb"))
    build_luxury_gt_dashboard(os.path.join(INTERIOR_DIR, "dashboard_luxury_gt.glb"))
    build_classic_dashboard(os.path.join(INTERIOR_DIR, "dashboard_classic.glb"))

    # 2. Standalone Center Consoles (2 files)
    build_executive_center_console(os.path.join(INTERIOR_DIR, "center_console_executive.glb"))
    build_gt3_center_console(os.path.join(INTERIOR_DIR, "center_console_gt3.glb"))

    # 3. Standalone Steering Wheels (5 files)
    build_sport_steering_wheel(os.path.join(INTERIOR_DIR, "steering_wheel_sport.glb"))
    build_gt3_yoke_steering_wheel(os.path.join(INTERIOR_DIR, "steering_wheel_gt3_yoke.glb"))
    build_luxury_3spoke_wheel(os.path.join(INTERIOR_DIR, "steering_luxury_3spoke.glb"))
    build_suede_carbon_steering_wheel(os.path.join(INTERIOR_DIR, "steering_suede_carbon.glb"))
    build_formula_steering_wheel(os.path.join(INTERIOR_DIR, "steering_formula.glb"))

    # 4. Standalone Seats (4 files)
    build_executive_seat(os.path.join(INTERIOR_DIR, "seat_executive_lounge.glb"))
    build_luxury_massage_seat(os.path.join(INTERIOR_DIR, "seat_luxury_massage.glb"))
    build_race_carbon_seat(os.path.join(INTERIOR_DIR, "seat_carbon_race.glb"))
    build_sport_bucket_seat(os.path.join(INTERIOR_DIR, "seat_sport_bucket.glb"))

    # 5. Pedals & Starlight Roof (2 files)
    build_race_pedals(os.path.join(INTERIOR_DIR, "pedals_race.glb"))
    build_starlight_roof(os.path.join(INTERIOR_DIR, "roof_starlight.glb"))

    # 6. Door Cards (2 files)
    build_executive_door_cards(os.path.join(INTERIOR_DIR, "door_cards_executive.glb"))
    build_sport_door_cards(os.path.join(INTERIOR_DIR, "door_cards_sport.glb"))

    # 7. Complete Integrated Cockpit Assemblies (9 files)
    build_complete_luxury_executive_cockpit(os.path.join(INTERIOR_DIR, "cockpit_luxury_executive.glb"))
    build_bespoke_atelier_cockpit(os.path.join(INTERIOR_DIR, "cockpit_bespoke_atelier.glb"))
    build_executive_theater_cockpit(os.path.join(INTERIOR_DIR, "cockpit_executive_theater.glb"))
    build_coachbuilt_vip_salon(os.path.join(INTERIOR_DIR, "cockpit_coachbuilt_vip_salon.glb"))
    
    build_complete_gt3_cockpit(os.path.join(INTERIOR_DIR, "cockpit_gt3_competition.glb"))
    build_endurance_gt3_cockpit(os.path.join(INTERIOR_DIR, "cockpit_endurance_gt3.glb"))
    build_hypercar_carbon_cockpit(os.path.join(INTERIOR_DIR, "cockpit_hypercar_carbon.glb"))
    build_hypercar_halo_cockpit(os.path.join(INTERIOR_DIR, "cockpit_hypercar_halo.glb"))
    build_quantum_hyperblade_cockpit(os.path.join(INTERIOR_DIR, "cockpit_quantum_hyperblade.glb"))

    print("\n" + "=" * 80)
    print("ALL 29 INTERIOR GLB ASSETS ENHANCED, DETAILED, SHADED, AND EXPORTED VIA BLENDER 5.2!")
    print("=" * 80)

if __name__ == "__main__":
    main()

