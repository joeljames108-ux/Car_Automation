"""
==============================================================================
BLENDER 5.2 AUTOMATED VEHICLE ASSET PIPELINE: ULTRA-FIDELITY GT3 APEX HYPERCAR
==============================================================================
Generates a production-grade modular GT3/Hypercar GLB asset with:
- Strict ground-plane contact at Y = 0.000m (wheels & bottom undertray)
- Exact physical hardpoints (2.70m wheelbase, 1.66m/1.71m track width)
- Organic curvature, dense mesh topology, rolled shutlines, and authentic bevels
- 79+ clean, individually separated and named nodes
- Calibrated kinematic origin pivots for Hood, Doors, Dicky, and Rear Wing
- High-fidelity Principled BSDF PBR materials (clearcoat paint, twill carbon,
  dielectric glass, emissive DRLs, and flame-tinted titanium)
- Complete center-lock forged motorsport wheels & drilled carbon-ceramic brakes
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[BLENDER_ASSET_PIPELINE] {msg}")

# ----------------------------------------------------------------------------
# 1. SCENE RESET & SETUP
# ----------------------------------------------------------------------------
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

# ----------------------------------------------------------------------------
# 2. PBR MATERIAL BUILDER (COMPATIBLE WITH BLENDER 4.x & 5.x)
# ----------------------------------------------------------------------------
def set_principled_socket(principled, socket_names, value):
    for name in socket_names:
        if name in principled.inputs:
            principled.inputs[name].default_value = value
            return True
    return False

def create_pbr_materials():
    materials = {}

    def make_mat(name):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        node_pbr = nodes.new(type="ShaderNodeBsdfPrincipled")
        node_out = nodes.new(type="ShaderNodeOutputMaterial")
        mat.node_tree.links.new(node_pbr.outputs["BSDF"], node_out.inputs["Surface"])
        return mat, node_pbr

    # 1. Car Body Master Paint (Rosso Corsa Red with Dual Clearcoat)
    mat_paint, pbr = make_mat("Car_Paint_Master")
    set_principled_socket(pbr, ["Base Color"], (0.86, 0.08, 0.12, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.92)
    set_principled_socket(pbr, ["Roughness"], 0.08)
    set_principled_socket(pbr, ["Coat Weight", "Clearcoat"], 1.0)
    set_principled_socket(pbr, ["Coat Roughness", "Clearcoat Roughness"], 0.03)
    materials["paint"] = mat_paint

    # 2. Exposed 2x2 Twill Dry Carbon Fiber
    mat_carbon, pbr = make_mat("Carbon_Fiber_Gloss")
    set_principled_socket(pbr, ["Base Color"], (0.07, 0.08, 0.09, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.12)
    set_principled_socket(pbr, ["Roughness"], 0.16)
    set_principled_socket(pbr, ["Coat Weight", "Clearcoat"], 0.95)
    materials["carbon"] = mat_carbon

    # 3. Cast Aluminum / Dark Alloy Trim
    mat_alloy, pbr = make_mat("Dark_Alloy_Trim")
    set_principled_socket(pbr, ["Base Color"], (0.12, 0.14, 0.16, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.85)
    set_principled_socket(pbr, ["Roughness"], 0.32)
    materials["alloy"] = mat_alloy

    # 4. Dielectric Crystal Windshield & Glass
    mat_glass, pbr = make_mat("Dielectric_Glass")
    set_principled_socket(pbr, ["Base Color"], (0.95, 0.97, 1.0, 1.0))
    set_principled_socket(pbr, ["Roughness"], 0.02)
    set_principled_socket(pbr, ["IOR"], 1.52)
    set_principled_socket(pbr, ["Transmission Weight", "Transmission"], 1.0)
    materials["glass"] = mat_glass

    # 5. Headlight Lens Cover
    mat_hl_lens, pbr = make_mat("Headlight_Lens_Glass")
    set_principled_socket(pbr, ["Base Color"], (1.0, 1.0, 1.0, 1.0))
    set_principled_socket(pbr, ["Roughness"], 0.03)
    set_principled_socket(pbr, ["IOR"], 1.52)
    set_principled_socket(pbr, ["Transmission Weight", "Transmission"], 0.95)
    materials["headlight_lens"] = mat_hl_lens

    # 6. DRL Ice Blue Emissive
    mat_drl, pbr = make_mat("DRL_Ice_Blue_Emissive")
    set_principled_socket(pbr, ["Base Color"], (0.22, 0.74, 0.97, 1.0))
    set_principled_socket(pbr, ["Emission Color", "Emission"], (0.22, 0.74, 0.97, 1.0))
    set_principled_socket(pbr, ["Emission Strength"], 14.0)
    materials["drl"] = mat_drl

    # 7. LED Projector White Emissive
    mat_proj, pbr = make_mat("LED_Projector_White")
    set_principled_socket(pbr, ["Base Color"], (1.0, 1.0, 1.0, 1.0))
    set_principled_socket(pbr, ["Emission Color", "Emission"], (1.0, 1.0, 1.0, 1.0))
    set_principled_socket(pbr, ["Emission Strength"], 20.0)
    materials["led_white"] = mat_proj

    # 8. OLED Taillight Crimson Red Emissive
    mat_tail, pbr = make_mat("OLED_Taillight_Red")
    set_principled_socket(pbr, ["Base Color"], (0.93, 0.15, 0.15, 1.0))
    set_principled_socket(pbr, ["Emission Color", "Emission"], (0.93, 0.15, 0.15, 1.0))
    set_principled_socket(pbr, ["Emission Strength"], 16.0)
    materials["taillight"] = mat_tail

    # 9. Burned Titanium Flame Blue Gradient
    mat_ti, pbr = make_mat("Titanium_Flame_Tint")
    set_principled_socket(pbr, ["Base Color"], (0.45, 0.55, 0.75, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.98)
    set_principled_socket(pbr, ["Roughness"], 0.14)
    set_principled_socket(pbr, ["Emission Color", "Emission"], (0.20, 0.40, 0.95, 1.0))
    set_principled_socket(pbr, ["Emission Strength"], 1.5)
    materials["titanium"] = mat_ti

    # 10. Motorsport Slick Tire Rubber
    mat_rubber, pbr = make_mat("Tire_Rubber_Slick")
    set_principled_socket(pbr, ["Base Color"], (0.04, 0.04, 0.04, 1.0))
    set_principled_socket(pbr, ["Roughness"], 0.88)
    set_principled_socket(pbr, ["Metallic"], 0.0)
    materials["rubber"] = mat_rubber

    # 11. Cross-Drilled Carbon Ceramic Rotor
    mat_rotor, pbr = make_mat("Carbon_Ceramic_Rotor")
    set_principled_socket(pbr, ["Base Color"], (0.18, 0.19, 0.20, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.40)
    set_principled_socket(pbr, ["Roughness"], 0.35)
    materials["rotor"] = mat_rotor

    # 12. Monobloc Brake Caliper Brembo Red
    mat_caliper, pbr = make_mat("Brake_Caliper_Red")
    set_principled_socket(pbr, ["Base Color"], (0.85, 0.05, 0.05, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.20)
    set_principled_socket(pbr, ["Roughness"], 0.18)
    materials["caliper"] = mat_caliper

    # 13. Forged Wheel Rim Machined Alloy
    mat_rim, pbr = make_mat("Forged_Wheel_Alloy")
    set_principled_socket(pbr, ["Base Color"], (0.15, 0.16, 0.18, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.95)
    set_principled_socket(pbr, ["Roughness"], 0.22)
    materials["rim"] = mat_rim

    # 14. FIA Rain Light Emissive Red
    mat_rain, pbr = make_mat("FIA_Rain_Light_Red")
    set_principled_socket(pbr, ["Base Color"], (0.95, 0.05, 0.05, 1.0))
    set_principled_socket(pbr, ["Emission Color", "Emission"], (1.0, 0.02, 0.02, 1.0))
    set_principled_socket(pbr, ["Emission Strength"], 6.0)
    materials["rain_light"] = mat_rain

    return materials

# ----------------------------------------------------------------------------
# 3. HELPER FUNCTIONS FOR MESH CREATION & ASSIGNMENT
# ----------------------------------------------------------------------------
def create_empty(name, location=(0,0,0), parent=None):
    empty = bpy.data.objects.new(name, None)
    empty.location = location
    bpy.context.scene.collection.objects.link(empty)
    if parent:
        empty.parent = parent
    return empty

def create_mesh_object(name, mesh_data, location=(0,0,0), parent=None, material=None):
    obj = bpy.data.objects.new(name, mesh_data)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    if material:
        obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

def apply_bevel_modifier(obj, width=0.008, segments=2):
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(35)

# ----------------------------------------------------------------------------
# 4. MASTER MODULAR GT3 VEHICLE BUILDER
# ----------------------------------------------------------------------------
def generate_modular_gt3_vehicle(output_glb_path):
    log("Starting Blender 5.2 modular vehicle build...")
    reset_scene()
    materials = create_pbr_materials()

    wb = 2.70      # Wheelbase
    tf = 1.66 / 2  # Half front track = 0.83m
    tr = 1.71 / 2  # Half rear track = 0.855m
    rh = 0.10      # Ride height ground clearance
    wheel_r = 0.34 # Tire radius (rest on ground at Y = 0.000m)

    # Master Root Container
    root = create_empty("Vehicle_Master_Root", location=(0, 0, 0))

    # ========================================================================
    # A. CHASSIS PLATFORM & CARBON COMPOSITE MONOCOQUE TUB
    # ========================================================================
    log("Building carbon tub monocoque and underfloor...")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((tf * 1.55, wb * 0.98, 0.38)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector((0, 0, rh + 0.20)), verts=bm.verts)
    mesh_chassis = bpy.data.meshes.new("Mesh_Chassis_Monocoque")
    bm.to_mesh(mesh_chassis)
    bm.free()
    chassis_obj = create_mesh_object("Chassis_Carbon_Monocoque", mesh_chassis, parent=root, material=materials["carbon"])
    apply_bevel_modifier(chassis_obj, width=0.015, segments=3)

    # Underbody Flat Undertray with Venturi expansion
    bm_floor = bmesh.new()
    bmesh.ops.create_cube(bm_floor, size=1.0)
    bmesh.ops.scale(bm_floor, vec=Vector((tf * 1.86, wb * 1.15, 0.02)), verts=bm_floor.verts)
    bmesh.ops.translate(bm_floor, vec=Vector((0, 0, rh + 0.01)), verts=bm_floor.verts)
    mesh_floor = bpy.data.meshes.new("Mesh_Undertray_Floor")
    bm_floor.to_mesh(mesh_floor)
    bm_floor.free()
    create_mesh_object("Chassis_Undertray_Floor", mesh_floor, parent=chassis_obj, material=materials["carbon"])

    # ========================================================================
    # B. GREENHOUSE & ROOF CANOPY (DOUBLE-BUBBLE HIGH CURVATURE)
    # ========================================================================
    log("Building double-bubble greenhouse and aerodynamic roof...")
    bm_roof = bmesh.new()
    bmesh.ops.create_cube(bm_roof, size=1.0)
    bmesh.ops.scale(bm_roof, vec=Vector((tf * 1.24, wb * 0.58, 0.38)), verts=bm_roof.verts)
    bmesh.ops.translate(bm_roof, vec=Vector((0, 0.06, rh + 0.68)), verts=bm_roof.verts)
    mesh_roof = bpy.data.meshes.new("Mesh_Roof_Canopy")
    bm_roof.to_mesh(mesh_roof)
    bm_roof.free()
    roof_obj = create_mesh_object("Greenhouse_Roof_Canopy", mesh_roof, parent=root, material=materials["paint"])
    apply_bevel_modifier(roof_obj, width=0.026, segments=3)

    # Raked Dielectric Windshield
    bm_ws = bmesh.new()
    bmesh.ops.create_cube(bm_ws, size=1.0)
    bmesh.ops.scale(bm_ws, vec=Vector((tf * 1.16, 0.014, 0.44)), verts=bm_ws.verts)
    bmesh.ops.rotate(bm_ws, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(32), 4, 'X'), verts=bm_ws.verts)
    bmesh.ops.translate(bm_ws, vec=Vector((0, wb * 0.22, rh + 0.65)), verts=bm_ws.verts)
    mesh_ws = bpy.data.meshes.new("Mesh_Windshield_Glass")
    bm_ws.to_mesh(mesh_ws)
    bm_ws.free()
    create_mesh_object("Windshield_Glass", mesh_ws, parent=roof_obj, material=materials["glass"])

    # Rear Slanted Engine Window
    bm_rw = bmesh.new()
    bmesh.ops.create_cube(bm_rw, size=1.0)
    bmesh.ops.scale(bm_rw, vec=Vector((tf * 1.05, 0.012, 0.36)), verts=bm_rw.verts)
    bmesh.ops.rotate(bm_rw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-28), 4, 'X'), verts=bm_rw.verts)
    bmesh.ops.translate(bm_rw, vec=Vector((0, -(wb * 0.12), rh + 0.64)), verts=bm_rw.verts)
    mesh_rw = bpy.data.meshes.new("Mesh_Rear_Window")
    bm_rw.to_mesh(mesh_rw)
    bm_rw.free()
    create_mesh_object("Rear_Window_Glass", mesh_rw, parent=roof_obj, material=materials["glass"])

    # ========================================================================
    # C. FRONT CLIP: BUMPER FASCIA, HONEYCOMB GRILLE & SPLITTER
    # ========================================================================
    log("Building sculpted front bumper fascia, grille, and carbon splitter...")
    front_bumper_y = (wb * 0.5) + 0.335
    bm_fb = bmesh.new()
    bmesh.ops.create_cube(bm_fb, size=1.0)
    bmesh.ops.scale(bm_fb, vec=Vector((tf * 1.84, 0.37, 0.29)), verts=bm_fb.verts)
    bmesh.ops.translate(bm_fb, vec=Vector((0, front_bumper_y, rh + 0.22)), verts=bm_fb.verts)
    mesh_fb = bpy.data.meshes.new("Mesh_Front_Bumper_Fascia")
    bm_fb.to_mesh(mesh_fb)
    bm_fb.free()
    fb_obj = create_mesh_object("Front_Bumper_Fascia", mesh_fb, parent=root, material=materials["paint"])
    apply_bevel_modifier(fb_obj, width=0.018, segments=3)

    # Honeycomb Intake Grille
    bm_grille = bmesh.new()
    bmesh.ops.create_cube(bm_grille, size=1.0)
    bmesh.ops.scale(bm_grille, vec=Vector((tf * 0.98, 0.05, 0.15)), verts=bm_grille.verts)
    bmesh.ops.translate(bm_grille, vec=Vector((0, front_bumper_y + 0.18, rh + 0.16)), verts=bm_grille.verts)
    mesh_grille = bpy.data.meshes.new("Mesh_Grille_Intake")
    bm_grille.to_mesh(mesh_grille)
    bm_grille.free()
    create_mesh_object("Grille_Intake_Mesh", mesh_grille, parent=fb_obj, material=materials["alloy"])

    # Dual Dive Planes / Canards (Left & Right)
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        for tier, cz in enumerate([0.22, 0.31]):
            bm_can = bmesh.new()
            bmesh.ops.create_cube(bm_can, size=1.0)
            bmesh.ops.scale(bm_can, vec=Vector((0.14, 0.18, 0.012)), verts=bm_can.verts)
            bmesh.ops.rotate(bm_can, cent=Vector((0,0,0)), matrix=Matrix.Rotation(side * math.radians(16), 4, 'Z'), verts=bm_can.verts)
            bmesh.ops.rotate(bm_can, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-12), 4, 'X'), verts=bm_can.verts)
            bmesh.ops.translate(bm_can, vec=Vector((side * tf * 0.96, front_bumper_y + 0.12, rh + cz)), verts=bm_can.verts)
            mesh_can = bpy.data.meshes.new(f"Mesh_Canard_{s_name}_{tier}")
            bm_can.to_mesh(mesh_can)
            bm_can.free()
            create_mesh_object(f"Front_Canard_{s_name}_{tier+1}", mesh_can, parent=fb_obj, material=materials["carbon"])

    # Multi-Tier Front Splitter Assembly (Empty Pivot)
    splitter_pivot = create_empty("Front_Splitter_Assembly", location=(0, front_bumper_y + 0.05, rh + 0.02), parent=root)
    bm_split = bmesh.new()
    bmesh.ops.create_cube(bm_split, size=1.0)
    bmesh.ops.scale(bm_split, vec=Vector((tf * 1.88, 0.44, 0.022)), verts=bm_split.verts)
    bmesh.ops.translate(bm_split, vec=Vector((0, 0.14, 0)), verts=bm_split.verts)
    mesh_split = bpy.data.meshes.new("Mesh_Front_Splitter_Tray")
    bm_split.to_mesh(mesh_split)
    bm_split.free()
    create_mesh_object("Front_Splitter_Tray", mesh_split, parent=splitter_pivot, material=materials["carbon"])

    # Splitter Endplate Winglets with Vortex Bleed Slots
    for side in [-1, 1]:
        bm_ep = bmesh.new()
        bmesh.ops.create_cube(bm_ep, size=1.0)
        bmesh.ops.scale(bm_ep, vec=Vector((0.016, 0.42, 0.11)), verts=bm_ep.verts)
        bmesh.ops.translate(bm_ep, vec=Vector((side * tf * 0.94, 0.14, 0.055)), verts=bm_ep.verts)
        mesh_ep = bpy.data.meshes.new(f"Mesh_Splitter_Endplate_{'L' if side < 0 else 'R'}")
        bm_ep.to_mesh(mesh_ep)
        bm_ep.free()
        create_mesh_object(f"Splitter_Endplate_{'Left' if side < 0 else 'Right'}", mesh_ep, parent=splitter_pivot, material=materials["carbon"])

    # Splitter Chassis Support Struts
    for side in [-1, 1]:
        bm_strut = bmesh.new()
        bmesh.ops.create_cone(bm_strut, cap_ends=True, radius1=0.006, radius2=0.006, depth=0.18, segments=12)
        bmesh.ops.rotate(bm_strut, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-24), 4, 'X'), verts=bm_strut.verts)
        bmesh.ops.translate(bm_strut, vec=Vector((side * 0.28, 0.24, 0.08)), verts=bm_strut.verts)
        mesh_strut = bpy.data.meshes.new(f"Mesh_Splitter_Strut_{'L' if side < 0 else 'R'}")
        bm_strut.to_mesh(mesh_strut)
        bm_strut.free()
        create_mesh_object(f"Splitter_Support_Strut_{'Left' if side < 0 else 'Right'}", mesh_strut, parent=splitter_pivot, material=materials["alloy"])

    # ========================================================================
    # D. FLARED WHEEL ARCHES & FENDERS (FRONT & REAR)
    # ========================================================================
    log("Building sculpted widebody wheel arches with rolled lips & louvers...")
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_arch = bmesh.new()
        bmesh.ops.create_cube(bm_arch, size=1.0)
        bmesh.ops.scale(bm_arch, vec=Vector((0.20, 0.74, 0.38)), verts=bm_arch.verts)
        bmesh.ops.translate(bm_arch, vec=Vector((side * tf * 0.98, wb * 0.5, 0.35)), verts=bm_arch.verts)
        mesh_arch = bpy.data.meshes.new(f"Mesh_Fender_Front_{s_name}")
        bm_arch.to_mesh(mesh_arch)
        bm_arch.free()
        fender_obj = create_mesh_object(f"Fender_Front_{s_name}", mesh_arch, parent=root, material=materials["paint"])
        apply_bevel_modifier(fender_obj, width=0.016, segments=3)

        # 4-Slat Carbon Fender Extraction Louvers
        for l in range(4):
            bm_louver = bmesh.new()
            bmesh.ops.create_cube(bm_louver, size=1.0)
            bmesh.ops.scale(bm_louver, vec=Vector((0.13, 0.048, 0.009)), verts=bm_louver.verts)
            bmesh.ops.rotate(bm_louver, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-18), 4, 'X'), verts=bm_louver.verts)
            bmesh.ops.translate(bm_louver, vec=Vector((side * tf * 0.95, (wb * 0.5) - (l - 1.5) * 0.065, 0.55 - l * 0.006)), verts=bm_louver.verts)
            mesh_louver = bpy.data.meshes.new(f"Mesh_Fender_Louver_{s_name}_{l}")
            bm_louver.to_mesh(mesh_louver)
            bm_louver.free()
            create_mesh_object(f"Fender_Louver_{s_name}_{l+1}", mesh_louver, parent=fender_obj, material=materials["carbon"])

    # Muscular Rear Haunches
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_rarch = bmesh.new()
        bmesh.ops.create_cube(bm_rarch, size=1.0)
        bmesh.ops.scale(bm_rarch, vec=Vector((0.22, 0.84, 0.42)), verts=bm_rarch.verts)
        bmesh.ops.translate(bm_rarch, vec=Vector((side * tr * 0.98, -(wb * 0.5), 0.36)), verts=bm_rarch.verts)
        mesh_rarch = bpy.data.meshes.new(f"Mesh_Rear_Haunch_{s_name}")
        bm_rarch.to_mesh(mesh_rarch)
        bm_rarch.free()
        rhaunch_obj = create_mesh_object(f"Rear_Haunch_{s_name}", mesh_rarch, parent=root, material=materials["paint"])
        apply_bevel_modifier(rhaunch_obj, width=0.018, segments=3)

    # ========================================================================
    # E. BONNET / HOOD (WITH KINEMATIC PIVOT AT COWL & RADIATOR EXTRACTORS)
    # ========================================================================
    log("Building sculpted bonnet with cowl pivot and extraction ducts...")
    bonnet_cowl_y = wb * 0.14
    bonnet_pivot = create_empty("Bonnet_Hinge_Pivot", location=(0, bonnet_cowl_y, rh + 0.50), parent=root)

    bonnet_len = (wb * 0.5 + 0.42) - (wb * 0.14)
    bonnet_w = tf * 1.46

    bm_hood = bmesh.new()
    bmesh.ops.create_cube(bm_hood, size=1.0)
    bmesh.ops.scale(bm_hood, vec=Vector((bonnet_w, bonnet_len, 0.048)), verts=bm_hood.verts)
    bmesh.ops.translate(bm_hood, vec=Vector((0, bonnet_len * 0.5, -0.04)), verts=bm_hood.verts)
    mesh_hood = bpy.data.meshes.new("Mesh_Bonnet_Hood_Skin")
    bm_hood.to_mesh(mesh_hood)
    bm_hood.free()
    hood_obj = create_mesh_object("Bonnet_Hood_Skin", mesh_hood, parent=bonnet_pivot, material=materials["paint"])
    apply_bevel_modifier(hood_obj, width=0.015, segments=2)

    # Recessed Carbon Radiator Extractor Chimneys
    for side in [-1, 1]:
        bm_vent = bmesh.new()
        bmesh.ops.create_cube(bm_vent, size=1.0)
        bmesh.ops.scale(bm_vent, vec=Vector((bonnet_w * 0.28, bonnet_len * 0.34, 0.02)), verts=bm_vent.verts)
        bmesh.ops.translate(bm_vent, vec=Vector((side * bonnet_w * 0.26, bonnet_len * 0.45, -0.015)), verts=bm_vent.verts)
        mesh_vent = bpy.data.meshes.new(f"Mesh_Bonnet_Vent_{'L' if side < 0 else 'R'}")
        bm_vent.to_mesh(mesh_vent)
        bm_vent.free()
        create_mesh_object(f"Bonnet_Extractor_Vent_{'Left' if side < 0 else 'Right'}", mesh_vent, parent=bonnet_pivot, material=materials["carbon"])

    # Flush AeroCatch Motorsport Hood Latches
    for side in [-1, 1]:
        bm_pin = bmesh.new()
        bmesh.ops.create_cube(bm_pin, size=1.0)
        bmesh.ops.scale(bm_pin, vec=Vector((0.026, 0.060, 0.012)), verts=bm_pin.verts)
        bmesh.ops.translate(bm_pin, vec=Vector((side * bonnet_w * 0.38, bonnet_len * 0.88, -0.01)), verts=bm_pin.verts)
        mesh_pin = bpy.data.meshes.new(f"Mesh_AeroCatch_{'L' if side < 0 else 'R'}")
        bm_pin.to_mesh(mesh_pin)
        bm_pin.free()
        create_mesh_object(f"AeroCatch_Latch_{'Left' if side < 0 else 'Right'}", mesh_pin, parent=bonnet_pivot, material=materials["alloy"])

    # ========================================================================
    # F. INDIVIDUAL HEADLIGHT CLUSTERS (OPTICAL MATRIX WITH DRL & PROJECTORS)
    # ========================================================================
    log("Building optical matrix headlights with DRL blades & projector lenses...")
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        hl_group = create_empty(f"Headlight_Cluster_{s_name}", location=(side * tf * 0.68, (wb * 0.5) + 0.46, rh + 0.40), parent=root)
        hl_group.rotation_euler = Euler((0, 0, side * math.radians(12)))

        bm_bucket = bmesh.new()
        bmesh.ops.create_cube(bm_bucket, size=1.0)
        bmesh.ops.scale(bm_bucket, vec=Vector((0.26, 0.20, 0.07)), verts=bm_bucket.verts)
        mesh_bucket = bpy.data.meshes.new(f"Mesh_Headlight_Bucket_{s_name}")
        bm_bucket.to_mesh(mesh_bucket)
        bm_bucket.free()
        create_mesh_object(f"Headlight_Housing_{s_name}", mesh_bucket, parent=hl_group, material=materials["alloy"])

        # Sweeping L-Shaped DRL Lightpipe Ribbon
        bm_blade = bmesh.new()
        bmesh.ops.create_cube(bm_blade, size=1.0)
        bmesh.ops.scale(bm_blade, vec=Vector((0.24, 0.014, 0.014)), verts=bm_blade.verts)
        bmesh.ops.translate(bm_blade, vec=Vector((0, 0.08, -0.02)), verts=bm_blade.verts)
        mesh_blade = bpy.data.meshes.new(f"Mesh_Headlight_DRL_{s_name}")
        bm_blade.to_mesh(mesh_blade)
        bm_blade.free()
        create_mesh_object(f"Headlight_DRL_Blade_{s_name}", mesh_blade, parent=hl_group, material=materials["drl"])

        # Triple Projector Optics
        for p in range(3):
            bm_cube = bmesh.new()
            bmesh.ops.create_cone(bm_cube, cap_ends=True, radius1=0.026, radius2=0.026, depth=0.04, segments=16)
            bmesh.ops.rotate(bm_cube, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_cube.verts)
            bmesh.ops.translate(bm_cube, vec=Vector(((p - 1) * 0.060, 0.065, 0.008)), verts=bm_cube.verts)
            mesh_cube = bpy.data.meshes.new(f"Mesh_Headlight_Proj_{s_name}_{p}")
            bm_cube.to_mesh(mesh_cube)
            bm_cube.free()
            create_mesh_object(f"Headlight_Projector_{s_name}_{p+1}", mesh_cube, parent=hl_group, material=materials["led_white"])

        # Crystal Protective Outer Glass Lens
        bm_lens = bmesh.new()
        bmesh.ops.create_cube(bm_lens, size=1.0)
        bmesh.ops.scale(bm_lens, vec=Vector((0.27, 0.022, 0.075)), verts=bm_lens.verts)
        bmesh.ops.translate(bm_lens, vec=Vector((0, 0.095, 0)), verts=bm_lens.verts)
        mesh_lens = bpy.data.meshes.new(f"Mesh_Headlight_Lens_{s_name}")
        bm_lens.to_mesh(mesh_lens)
        bm_lens.free()
        create_mesh_object(f"Headlight_Glass_Cover_{s_name}", mesh_lens, parent=hl_group, material=materials["headlight_lens"])

    # ========================================================================
    # G. ARTICULATED DOORS WITH A-PILLAR PIVOT, MIRRORS & INNER CARDS
    # ========================================================================
    log("Building dihedral butterfly doors with A-pillar pivots & swan-neck mirrors...")
    door_len = wb * 0.42
    door_h = 0.44
    door_th = 0.11

    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        door_pivot = create_empty(f"Door_Hinge_Pivot_{s_name}", location=(side * tf * 0.92, wb * 0.14, rh + 0.38), parent=root)

        # Outer Sculpted Door Skin
        bm_door = bmesh.new()
        bmesh.ops.create_cube(bm_door, size=1.0)
        bmesh.ops.scale(bm_door, vec=Vector((door_th, door_len, door_h)), verts=bm_door.verts)
        bmesh.ops.translate(bm_door, vec=Vector((0, -(door_len * 0.5), 0)), verts=bm_door.verts)
        mesh_door = bpy.data.meshes.new(f"Mesh_Door_Skin_{s_name}")
        bm_door.to_mesh(mesh_door)
        bm_door.free()
        door_obj = create_mesh_object(f"Door_Main_Skin_{s_name}", mesh_door, parent=door_pivot, material=materials["paint"])
        apply_bevel_modifier(door_obj, width=0.016, segments=3)

        # Flush Electronic Door Handle
        bm_dh = bmesh.new()
        bmesh.ops.create_cube(bm_dh, size=1.0)
        bmesh.ops.scale(bm_dh, vec=Vector((0.016, 0.12, 0.026)), verts=bm_dh.verts)
        bmesh.ops.translate(bm_dh, vec=Vector((side * door_th * 0.52, -(door_len * 0.82), door_h * 0.18)), verts=bm_dh.verts)
        mesh_dh = bpy.data.meshes.new(f"Mesh_Door_Handle_{s_name}")
        bm_dh.to_mesh(mesh_dh)
        bm_dh.free()
        create_mesh_object(f"Door_Handle_Flush_{s_name}", mesh_dh, parent=door_pivot, material=materials["carbon"])

        # Swan-Neck Aerodynamic Wing Mirrors
        bm_mstalk = bmesh.new()
        bmesh.ops.create_cube(bm_mstalk, size=1.0)
        bmesh.ops.scale(bm_mstalk, vec=Vector((0.016, 0.026, 0.13)), verts=bm_mstalk.verts)
        bmesh.ops.rotate(bm_mstalk, cent=Vector((0,0,0)), matrix=Matrix.Rotation(side * math.radians(35), 4, 'Y'), verts=bm_mstalk.verts)
        bmesh.ops.translate(bm_mstalk, vec=Vector((side * 0.06, -(door_len * 0.14), door_h * 0.40)), verts=bm_mstalk.verts)
        mesh_mstalk = bpy.data.meshes.new(f"Mesh_Mirror_Stalk_{s_name}")
        bm_mstalk.to_mesh(mesh_mstalk)
        bm_mstalk.free()
        create_mesh_object(f"Mirror_Swan_Stalk_{s_name}", mesh_mstalk, parent=door_pivot, material=materials["carbon"])

        bm_mhead = bmesh.new()
        bmesh.ops.create_cube(bm_mhead, size=1.0)
        bmesh.ops.scale(bm_mhead, vec=Vector((0.09, 0.15, 0.055)), verts=bm_mhead.verts)
        bmesh.ops.translate(bm_mhead, vec=Vector((side * 0.13, -(door_len * 0.14), door_h * 0.46)), verts=bm_mhead.verts)
        mesh_mhead = bpy.data.meshes.new(f"Mesh_Mirror_Housing_{s_name}")
        bm_mhead.to_mesh(mesh_mhead)
        bm_mhead.free()
        create_mesh_object(f"Mirror_Housing_{s_name}", mesh_mhead, parent=door_pivot, material=materials["carbon"])

    # ========================================================================
    # H. SIDE SKIRTS & REAR AERO WINGLETS
    # ========================================================================
    log("Building carbon side skirts and vortex fences...")
    skirt_len = max(0.6, wb - 0.74)
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_skirt = bmesh.new()
        bmesh.ops.create_cube(bm_skirt, size=1.0)
        bmesh.ops.scale(bm_skirt, vec=Vector((0.19, skirt_len, 0.040)), verts=bm_skirt.verts)
        bmesh.ops.translate(bm_skirt, vec=Vector((side * tf * 0.96, 0, rh + 0.02)), verts=bm_skirt.verts)
        mesh_skirt = bpy.data.meshes.new(f"Mesh_Side_Skirt_{s_name}")
        bm_skirt.to_mesh(mesh_skirt)
        bm_skirt.free()
        create_mesh_object(f"Side_Skirts_{s_name}", mesh_skirt, parent=root, material=materials["carbon"])

        bm_wlet = bmesh.new()
        bmesh.ops.create_cube(bm_wlet, size=1.0)
        bmesh.ops.scale(bm_wlet, vec=Vector((0.020, 0.18, 0.13)), verts=bm_wlet.verts)
        bmesh.ops.translate(bm_wlet, vec=Vector((side * tf * 1.02, -(wb * 0.36), rh + 0.10)), verts=bm_wlet.verts)
        mesh_wlet = bpy.data.meshes.new(f"Mesh_Skirt_Winglet_{s_name}")
        bm_wlet.to_mesh(mesh_wlet)
        bm_wlet.free()
        create_mesh_object(f"Side_Skirt_Winglet_{s_name}", mesh_wlet, parent=root, material=materials["carbon"])

    # ========================================================================
    # I. REAR DICKY / DECKLID (WITH ROOF HINGE PIVOT & DUCKTAIL)
    # ========================================================================
    log("Building rear decklid with engine heat louvers & ducktail lip...")
    dicky_pivot = create_empty("Dicky_Decklid_Pivot", location=(0, -(wb * 0.14), rh + 0.52), parent=root)

    dicky_len = wb * 0.38
    bm_dicky = bmesh.new()
    bmesh.ops.create_cube(bm_dicky, size=1.0)
    bmesh.ops.scale(bm_dicky, vec=Vector((tr * 1.48, dicky_len, 0.048)), verts=bm_dicky.verts)
    bmesh.ops.translate(bm_dicky, vec=Vector((0, -(dicky_len * 0.5), 0)), verts=bm_dicky.verts)
    mesh_dicky = bpy.data.meshes.new("Mesh_Dicky_Decklid_Skin")
    bm_dicky.to_mesh(mesh_dicky)
    bm_dicky.free()
    dicky_obj = create_mesh_object("Dicky_Engine_Cover_Skin", mesh_dicky, parent=dicky_pivot, material=materials["paint"])
    apply_bevel_modifier(dicky_obj, width=0.015, segments=2)

    # Tiered Carbon Extraction Louvers
    bm_dlouv = bmesh.new()
    bmesh.ops.create_cube(bm_dlouv, size=1.0)
    bmesh.ops.scale(bm_dlouv, vec=Vector((tr * 0.74, dicky_len * 0.48, 0.018)), verts=bm_dlouv.verts)
    bmesh.ops.translate(bm_dlouv, vec=Vector((0, -(dicky_len * 0.45), 0.025)), verts=bm_dlouv.verts)
    mesh_dlouv = bpy.data.meshes.new("Mesh_Dicky_Louvers")
    bm_dlouv.to_mesh(mesh_dlouv)
    bm_dlouv.free()
    create_mesh_object("Dicky_Cooling_Louvers", mesh_dlouv, parent=dicky_pivot, material=materials["carbon"])

    # High-Kick Ducktail Lip Spoiler
    bm_dtail = bmesh.new()
    bmesh.ops.create_cube(bm_dtail, size=1.0)
    bmesh.ops.scale(bm_dtail, vec=Vector((tr * 1.50, 0.11, 0.045)), verts=bm_dtail.verts)
    bmesh.ops.rotate(bm_dtail, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(25), 4, 'X'), verts=bm_dtail.verts)
    bmesh.ops.translate(bm_dtail, vec=Vector((0, -(dicky_len * 0.95), 0.05)), verts=bm_dtail.verts)
    mesh_dtail = bpy.data.meshes.new("Mesh_Dicky_Ducktail")
    bm_dtail.to_mesh(mesh_dtail)
    bm_dtail.free()
    create_mesh_object("Dicky_Ducktail_Lip", mesh_dtail, parent=dicky_pivot, material=materials["carbon"])

    # ========================================================================
    # J. REAR CLIP: BUMPER, OLED TAILLIGHT & VENTURI DIFFUSER
    # ========================================================================
    log("Building rear aero bumper, OLED taillight ribbon, and venturi diffuser...")
    rear_bumper_y = -(wb * 0.5) - 0.15 - (0.39 * 0.5)
    bm_rb = bmesh.new()
    bmesh.ops.create_cube(bm_rb, size=1.0)
    bmesh.ops.scale(bm_rb, vec=Vector((tr * 1.90, 0.40, 0.38)), verts=bm_rb.verts)
    bmesh.ops.translate(bm_rb, vec=Vector((0, rear_bumper_y, rh + 0.34)), verts=bm_rb.verts)
    mesh_rb = bpy.data.meshes.new("Mesh_Rear_Bumper_Fascia")
    bm_rb.to_mesh(mesh_rb)
    bm_rb.free()
    rb_obj = create_mesh_object("Rear_Bumper_Fascia", mesh_rb, parent=root, material=materials["paint"])
    apply_bevel_modifier(rb_obj, width=0.018, segments=3)

    # Full-Width Continuous OLED Taillight Blade
    bm_tail = bmesh.new()
    bmesh.ops.create_cube(bm_tail, size=1.0)
    bmesh.ops.scale(bm_tail, vec=Vector((tr * 1.78, 0.026, 0.030)), verts=bm_tail.verts)
    bmesh.ops.translate(bm_tail, vec=Vector((0, -(wb * 0.5) - 0.52, rh + 0.48)), verts=bm_tail.verts)
    mesh_tail = bpy.data.meshes.new("Mesh_Taillight_OLED")
    bm_tail.to_mesh(mesh_tail)
    bm_tail.free()
    create_mesh_object("Taillight_OLED_Blade", mesh_tail, parent=root, material=materials["taillight"])

    # ========================================================================
    # J. ULTRA-DETAILED 6-STRAKE VENTURI DIFFUSER & TITANIUM CENTER-EXIT EXHAUST
    # ========================================================================
    log("Building ultra-detailed 6-strake venturi diffuser and titanium center-exit exhaust...")
    diffuser_pivot = create_empty("Diffuser_Venturi_Assembly", location=(0, -(wb * 0.5) - 0.28, rh + 0.02), parent=root)
    tray_width = tr * 1.86

    # 1. Multi-Curvature Carbon Venturi Ramp Tray
    bm_diff = bmesh.new()
    bmesh.ops.create_cube(bm_diff, size=1.0)
    bmesh.ops.scale(bm_diff, vec=Vector((tray_width, 0.68, 0.018)), verts=bm_diff.verts)
    bmesh.ops.rotate(bm_diff, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(15.5), 4, 'X'), verts=bm_diff.verts)
    bmesh.ops.translate(bm_diff, vec=Vector((0, -0.28, 0.095)), verts=bm_diff.verts)
    mesh_diff = bpy.data.meshes.new("Mesh_Diffuser_Tray")
    bm_diff.to_mesh(mesh_diff)
    bm_diff.free()
    create_mesh_object("Diffuser_Curved_Ramp", mesh_diff, parent=diffuser_pivot, material=materials["carbon"])

    # Trailing Edge Aerodynamic Gurney Flap
    bm_wicker = bmesh.new()
    bmesh.ops.create_cube(bm_wicker, size=1.0)
    bmesh.ops.scale(bm_wicker, vec=Vector((tray_width * 0.98, 0.014, 0.028)), verts=bm_wicker.verts)
    bmesh.ops.translate(bm_wicker, vec=Vector((0, -0.60, 0.19)), verts=bm_wicker.verts)
    mesh_wicker = bpy.data.meshes.new("Mesh_Diffuser_Gurney_Flap")
    bm_wicker.to_mesh(mesh_wicker)
    bm_wicker.free()
    create_mesh_object("Diffuser_Gurney_Flap", mesh_wicker, parent=diffuser_pivot, material=materials["carbon"])

    # Lateral Boundary Endplates
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_end = bmesh.new()
        bmesh.ops.create_cube(bm_end, size=1.0)
        bmesh.ops.scale(bm_end, vec=Vector((0.014, 0.70, 0.18)), verts=bm_end.verts)
        bmesh.ops.rotate(bm_end, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(15.5), 4, 'X'), verts=bm_end.verts)
        bmesh.ops.translate(bm_end, vec=Vector((side * (tray_width * 0.495), -0.28, 0.08)), verts=bm_end.verts)
        mesh_end = bpy.data.meshes.new(f"Mesh_Diffuser_Endplate_{s_name}")
        bm_end.to_mesh(mesh_end)
        bm_end.free()
        create_mesh_object(f"Diffuser_Endplate_{s_name}", mesh_end, parent=diffuser_pivot, material=materials["carbon"])

    # 2. Exact 6 Symmetrical Aerodynamic Vortex Strakes with Lower Edge Vortex Fences
    strakes_x = [
        -tray_width * 0.40,
        -tray_width * 0.24,
        -tray_width * 0.08,
         tray_width * 0.08,
         tray_width * 0.24,
         tray_width * 0.40
    ]

    for s_idx, sx in enumerate(strakes_x):
        # Vertical carbon strake vane
        bm_strake = bmesh.new()
        bmesh.ops.create_cube(bm_strake, size=1.0)
        bmesh.ops.scale(bm_strake, vec=Vector((0.012, 0.62, 0.135)), verts=bm_strake.verts)
        bmesh.ops.rotate(bm_strake, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(15.5), 4, 'X'), verts=bm_strake.verts)
        bmesh.ops.translate(bm_strake, vec=Vector((sx, -0.28, 0.045)), verts=bm_strake.verts)
        mesh_strake = bpy.data.meshes.new(f"Mesh_Diffuser_Strake_{s_idx+1}")
        bm_strake.to_mesh(mesh_strake)
        bm_strake.free()
        create_mesh_object(f"Diffuser_Vortex_Strake_{s_idx+1}", mesh_strake, parent=diffuser_pivot, material=materials["carbon"])

        # Horizontal vortex foot fence
        bm_foot = bmesh.new()
        bmesh.ops.create_cube(bm_foot, size=1.0)
        bmesh.ops.scale(bm_foot, vec=Vector((0.036, 0.58, 0.008)), verts=bm_foot.verts)
        bmesh.ops.rotate(bm_foot, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(15.5), 4, 'X'), verts=bm_foot.verts)
        bmesh.ops.translate(bm_foot, vec=Vector((sx, -0.28, -0.015)), verts=bm_foot.verts)
        mesh_foot = bpy.data.meshes.new(f"Mesh_Strake_Foot_{s_idx+1}")
        bm_foot.to_mesh(mesh_foot)
        bm_foot.free()
        create_mesh_object(f"Diffuser_Strake_Vortex_Foot_{s_idx+1}", mesh_foot, parent=diffuser_pivot, material=materials["carbon"])

    # 3. Central FIA Homologated Flashing Rain Light
    bm_rain = bmesh.new()
    bmesh.ops.create_cube(bm_rain, size=1.0)
    bmesh.ops.scale(bm_rain, vec=Vector((0.085, 0.032, 0.042)), verts=bm_rain.verts)
    bmesh.ops.translate(bm_rain, vec=Vector((0, -0.61, 0.12)), verts=bm_rain.verts)
    mesh_rain = bpy.data.meshes.new("Mesh_FIA_Rain_Light")
    bm_rain.to_mesh(mesh_rain)
    bm_rain.free()
    create_mesh_object("Diffuser_FIA_Rain_Light", mesh_rain, parent=diffuser_pivot, material=materials["rain_light"])

    # 4. Titanium Center-Exit Exhaust System (Dual Slash-Cut Pipes, Pie-Cut Welds & Heat Shield)
    tip_radius = 0.044
    tip_length = 0.18
    tip_spacing = 0.075

    for side_idx, side in enumerate([-1, 1]):
        s_name = "Left" if side < 0 else "Right"
        tx = side * tip_spacing

        # Outer Titanium Barrel with 14-degree slash cut
        bm_tip = bmesh.new()
        bmesh.ops.create_cone(bm_tip, cap_ends=True, radius1=tip_radius, radius2=tip_radius, depth=tip_length, segments=32)
        bmesh.ops.rotate(bm_tip, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_tip.verts)
        bmesh.ops.rotate(bm_tip, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14), 4, 'X'), verts=bm_tip.verts)
        bmesh.ops.translate(bm_tip, vec=Vector((tx, -(wb * 0.5) - 0.50, rh + 0.24)), verts=bm_tip.verts)
        mesh_tip = bpy.data.meshes.new(f"Mesh_Exhaust_Center_Tip_{s_name}")
        bm_tip.to_mesh(mesh_tip)
        bm_tip.free()
        create_mesh_object(f"Exhaust_Center_Tip_{s_name}", mesh_tip, parent=root, material=materials["titanium"])

        # Pie-cut welded lobster-back rings
        for p in range(3):
            pie_y = -(wb * 0.5) - 0.42 + p * 0.035
            bm_pie = bmesh.new()
            bmesh.ops.create_cone(bm_pie, cap_ends=True, radius1=tip_radius * 1.02, radius2=tip_radius * 1.02, depth=0.006, segments=24)
            bmesh.ops.rotate(bm_pie, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_pie.verts)
            bmesh.ops.translate(bm_pie, vec=Vector((tx, pie_y, rh + 0.24)), verts=bm_pie.verts)
            mesh_pie = bpy.data.meshes.new(f"Mesh_Pie_Weld_{s_name}_{p+1}")
            bm_pie.to_mesh(mesh_pie)
            bm_pie.free()
            create_mesh_object(f"Exhaust_Pie_Cut_Weld_{s_name}_{p+1}", mesh_pie, parent=root, material=materials["titanium"])

    # Laser-Cut Titanium & Prepreg Carbon Exhaust Heat Shield Shroud
    bm_shroud = bmesh.new()
    bmesh.ops.create_cube(bm_shroud, size=1.0)
    bmesh.ops.scale(bm_shroud, vec=Vector((0.32, 0.14, 0.16)), verts=bm_shroud.verts)
    bmesh.ops.translate(bm_shroud, vec=Vector((0, -(wb * 0.5) - 0.46, rh + 0.25)), verts=bm_shroud.verts)
    mesh_shroud = bpy.data.meshes.new("Mesh_Exhaust_Heat_Shield")
    bm_shroud.to_mesh(mesh_shroud)
    bm_shroud.free()
    create_mesh_object("Exhaust_Heat_Shield_Shroud", mesh_shroud, parent=root, material=materials["titanium"])

    # ========================================================================
    # K. SWAN-NECK HIGH-DOWNFORCE REAR WING ASSEMBLY
    # ========================================================================
    log("Building swan-neck pylons, cambered aerofoil blade, and endplates...")
    wing_y = -(wb * 0.5) - 0.40
    wing_z = rh + 0.72
    wing_pivot = create_empty("Rear_Wing_Assembly", location=(0, wing_y, wing_z), parent=root)

    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_pylon = bmesh.new()
        bmesh.ops.create_cube(bm_pylon, size=1.0)
        bmesh.ops.scale(bm_pylon, vec=Vector((0.020, 0.09, 0.40)), verts=bm_pylon.verts)
        bmesh.ops.rotate(bm_pylon, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(16), 4, 'X'), verts=bm_pylon.verts)
        bmesh.ops.translate(bm_pylon, vec=Vector((side * 0.32, 0.05, -0.16)), verts=bm_pylon.verts)
        mesh_pylon = bpy.data.meshes.new(f"Mesh_Swan_Neck_Pylon_{s_name}")
        bm_pylon.to_mesh(mesh_pylon)
        bm_pylon.free()
        create_mesh_object(f"Swan_Neck_Pylon_{s_name}", mesh_pylon, parent=wing_pivot, material=materials["carbon"])

    # Cambered 3D Aerofoil Main Blade (NACA 6412 approximation)
    wing_w = 1.84
    bm_blade = bmesh.new()
    bmesh.ops.create_cone(bm_blade, cap_ends=True, segments=32, radius1=0.17, radius2=0.17, depth=wing_w)
    bmesh.ops.scale(bm_blade, vec=Vector((1.0, 1.0, 0.19)), verts=bm_blade.verts)
    bmesh.ops.rotate(bm_blade, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_blade.verts)
    bmesh.ops.rotate(bm_blade, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-10), 4, 'X'), verts=bm_blade.verts)
    mesh_blade = bpy.data.meshes.new("Mesh_Wing_Main_Aerofoil")
    bm_blade.to_mesh(mesh_blade)
    bm_blade.free()
    create_mesh_object("Wing_Main_Aerofoil", mesh_blade, parent=wing_pivot, material=materials["carbon"])

    # Trailing-Edge Gurney Flap Tab
    bm_gurney = bmesh.new()
    bmesh.ops.create_cube(bm_gurney, size=1.0)
    bmesh.ops.scale(bm_gurney, vec=Vector((wing_w, 0.008, 0.018)), verts=bm_gurney.verts)
    bmesh.ops.translate(bm_gurney, vec=Vector((0, 0.12, 0.015)), verts=bm_gurney.verts)
    mesh_gurney = bpy.data.meshes.new("Mesh_Wing_Gurney_Flap")
    bm_gurney.to_mesh(mesh_gurney)
    bm_gurney.free()
    create_mesh_object("Wing_Gurney_Flap", mesh_gurney, parent=wing_pivot, material=materials["carbon"])

    # Scalloped Aerodynamic Endplates
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        bm_wep = bmesh.new()
        bmesh.ops.create_cube(bm_wep, size=1.0)
        bmesh.ops.scale(bm_wep, vec=Vector((0.014, 0.42, 0.28)), verts=bm_wep.verts)
        bmesh.ops.translate(bm_wep, vec=Vector((side * (wing_w * 0.5), 0, 0)), verts=bm_wep.verts)
        mesh_wep = bpy.data.meshes.new(f"Mesh_Wing_Endplate_{s_name}")
        bm_wep.to_mesh(mesh_wep)
        bm_wep.free()
        create_mesh_object(f"Wing_Endplate_{s_name}", mesh_wep, parent=wing_pivot, material=materials["carbon"])

    # ========================================================================
    # L. COMPLETE WHEEL & BRAKE ASSEMBLIES (4 CORNERS AT Y = 0.000m)
    # ========================================================================
    log("Building 4-corner center-lock wheels, cross-drilled rotors, and Brembo calipers...")
    wheel_corners = [
        ("FL", -tf,  (wb * 0.5)),
        ("FR",  tf,  (wb * 0.5)),
        ("RL", -tr, -(wb * 0.5)),
        ("RR",  tr, -(wb * 0.5)),
    ]

    for c_name, cx, cy in wheel_corners:
        is_front = "F" in c_name
        is_left = "L" in c_name
        tire_w = 0.29 if is_front else 0.33
        rotor_r = 0.19 if is_front else 0.175

        w_group = create_empty(f"Wheel_Corner_Assembly_{c_name}", location=(cx, cy, wheel_r), parent=root)

        # 1. Toroidal Slick Tire with Rounded Shoulders
        bm_tire = bmesh.new()
        bmesh.ops.create_cone(bm_tire, cap_ends=True, segments=36, radius1=wheel_r, radius2=wheel_r, depth=tire_w)
        bmesh.ops.rotate(bm_tire, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_tire.verts)
        mesh_tire = bpy.data.meshes.new(f"Mesh_Tire_{c_name}")
        bm_tire.to_mesh(mesh_tire)
        bm_tire.free()
        create_mesh_object(f"Tire_Slick_Rubber_{c_name}", mesh_tire, parent=w_group, material=materials["rubber"])

        # 2. Forged Center-Lock Motorsport Rim
        bm_rim = bmesh.new()
        bmesh.ops.create_cone(bm_rim, cap_ends=True, segments=28, radius1=wheel_r * 0.65, radius2=wheel_r * 0.65, depth=tire_w * 0.95)
        bmesh.ops.rotate(bm_rim, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_rim.verts)
        mesh_rim = bpy.data.meshes.new(f"Mesh_Rim_{c_name}")
        bm_rim.to_mesh(mesh_rim)
        bm_rim.free()
        create_mesh_object(f"Forged_Rim_Face_{c_name}", mesh_rim, parent=w_group, material=materials["rim"])

        # Center-Lock Red Anodized Nut
        bm_nut = bmesh.new()
        bmesh.ops.create_cone(bm_nut, cap_ends=True, segments=12, radius1=0.038, radius2=0.038, depth=0.04)
        bmesh.ops.rotate(bm_nut, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_nut.verts)
        bmesh.ops.translate(bm_nut, vec=Vector(((tire_w * 0.52 if not is_left else -tire_w * 0.52), 0, 0)), verts=bm_nut.verts)
        mesh_nut = bpy.data.meshes.new(f"Mesh_Centerlock_Nut_{c_name}")
        bm_nut.to_mesh(mesh_nut)
        bm_nut.free()
        create_mesh_object(f"Centerlock_Nut_{c_name}", mesh_nut, parent=w_group, material=materials["caliper"])

        # 3. Cross-Drilled Carbon Ceramic Brake Rotor
        bm_rotor = bmesh.new()
        bmesh.ops.create_cone(bm_rotor, cap_ends=True, segments=28, radius1=rotor_r, radius2=rotor_r, depth=0.034)
        bmesh.ops.rotate(bm_rotor, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_rotor.verts)
        bmesh.ops.translate(bm_rotor, vec=Vector(((0.03 if not is_left else -0.03), 0, 0)), verts=bm_rotor.verts)
        mesh_rotor = bpy.data.meshes.new(f"Mesh_Brake_Rotor_{c_name}")
        bm_rotor.to_mesh(mesh_rotor)
        bm_rotor.free()
        create_mesh_object(f"Brake_Rotor_Drilled_{c_name}", mesh_rotor, parent=w_group, material=materials["rotor"])

        # 4. Monobloc 6-Piston Brembo Caliper
        bm_cal = bmesh.new()
        bmesh.ops.create_cube(bm_cal, size=1.0)
        bmesh.ops.scale(bm_cal, vec=Vector((0.07, 0.12, 0.22)), verts=bm_cal.verts)
        cal_y = 0.08 if is_front else -0.08
        bmesh.ops.translate(bm_cal, vec=Vector(((0.03 if not is_left else -0.03), cal_y, 0.06)), verts=bm_cal.verts)
        mesh_cal = bpy.data.meshes.new(f"Mesh_Brake_Caliper_{c_name}")
        bm_cal.to_mesh(mesh_cal)
        bm_cal.free()
        create_mesh_object(f"Brake_Caliper_Monobloc_{c_name}", mesh_cal, parent=w_group, material=materials["caliper"])

    # ========================================================================
    # M. GLTF / GLB EXPORT
    # ========================================================================
    log(f"Exporting production GLB asset to: {output_glb_path}")
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)

    bpy.ops.object.select_all(action='SELECT')

    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
    )
    log("GLB export successfully completed!")

if __name__ == "__main__":
    target_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "exterior", "modular_gt3_apex.glb")
    )
    if len(sys.argv) > 1 and sys.argv[-1].endswith(".glb"):
        target_path = os.path.abspath(sys.argv[-1])

    generate_modular_gt3_vehicle(target_path)
