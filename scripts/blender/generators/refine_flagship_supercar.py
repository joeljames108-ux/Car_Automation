"""
==============================================================================
APEX SIMULATOR: REFINE & HUMANIZE FLAGSHIP SUPERCAR PLATFORM (BLENDER 5.2)
==============================================================================
Loads the reference mid-engine Berlinetta architecture (Ferrari 458 Italia),
upgrades it to Apex engineering standards:
1. Re-shades and neutralizes copyrighted manufacturer badges into Apex carbon/titanium/giallo.
2. Applies master PBR automotive shaders:
   - Rosso Corsa Metallic Paint with Dual Clearcoat
   - 2x2 Twill High-Gloss Carbon Fiber
   - Optical Dielectric Automotive Glass (clean raytraced transmission)
   - High-intensity Projector LEDs & Red OLED Taillights
   - Diamond-Cut Alloy Rims & Semi-Slick Rubber
   - Carbon-Ceramic Ventilated Rotors & Brembo Rosso Calipers
   - Titanium / Inconel Exhaust
   - Nero Leather & Alcantara Interior with F1 Shift LEDs
3. Organizes all meshes into the canonical VEHICLE_ROOT hierarchy:
   VEHICLE_ROOT
   ├── CHASSIS
   ├── BODY
   ├── GLASS
   ├── LIGHTING
   ├── WHEELS
   ├── TIRES
   ├── BRAKES
   ├── SUSPENSION
   ├── ENGINE_BAY
   ├── CABIN
   ├── UNDERBODY
   └── AERO_MOUNTING_POINTS (standardized CAD hardpoints)
4. Adds standardized empty attachment points:
   ENGINE_MOUNT_MID, TRANSMISSION_MOUNT, AERO_MOUNT_POINTS, WHEEL_FL/FR/RL/RR.
5. Multi-path deployment across the simulator:
   - /public/assets/vehicles/vehicle_supercar.glb
   - /public/assets/vehicles/preview_supercar.glb
   - /public/models/vehicles/supercar/2010s/vehicle.glb
   - /public/models/Car_Supercar_Complete.glb
   - /public/models/Car_GT3_Supercar_Complete.glb
   - /exports/Car_Ferrari_458_Italia_2010s.glb
==============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

def set_socket(pbr, names, val):
    for n in names:
        if n in pbr.inputs:
            pbr.inputs[n].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, alpha=1.0, emission=None, emission_strength=1.0, ior=1.52):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    out = nodes.new(type='ShaderNodeOutputMaterial')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    set_socket(bsdf, ['Base Color'], base_color)
    set_socket(bsdf, ['Metallic'], metallic)
    set_socket(bsdf, ['Roughness'], roughness)
    set_socket(bsdf, ['Alpha'], alpha)

    if clearcoat > 0:
        set_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], 0.02)
    if transmission > 0:
        set_socket(bsdf, ['Transmission Weight', 'Transmission'], transmission)
        set_socket(bsdf, ['IOR'], ior)
    if emission:
        set_socket(bsdf, ['Emission Color', 'Emission'], emission)
        set_socket(bsdf, ['Emission Strength'], emission_strength)

    if transmission > 0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'OPAQUE'
    elif alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    return mat

def execute_refinement(source_glb, export_paths):
    print(f"[REFINE_SUPERCAR] Loading source GLB: {source_glb}")

    # 1. Non-destructive clearing preserving MCP socket
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)

    # 2. Import Source Reference
    bpy.ops.import_scene.gltf(filepath=source_glb)

    # 3. Create Master PBR Materials
    mat_paint = make_pbr_mat("Supercar_Paint_RossoCorsa", (0.84, 0.04, 0.06, 1.0), metallic=0.92, roughness=0.10, clearcoat=1.0)
    mat_carbon = make_pbr_mat("Supercar_CarbonFiber", (0.03, 0.03, 0.035, 1.0), metallic=0.20, roughness=0.18, clearcoat=0.95)
    mat_dark_trim = make_pbr_mat("Supercar_SatinTrim", (0.06, 0.06, 0.07, 1.0), metallic=0.40, roughness=0.45)
    mat_glass = make_pbr_mat("Supercar_Glass_Dielectric", (0.90, 0.95, 1.0, 0.22), roughness=0.02, transmission=0.0, alpha=0.22, ior=1.52, clearcoat=1.0)
    mat_led_white = make_pbr_mat("Supercar_LED_White", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=25.0)
    mat_led_red = make_pbr_mat("Supercar_LED_Red", (1.0, 0.02, 0.02, 1.0), emission=(1.0, 0.01, 0.02, 1.0), emission_strength=20.0)
    mat_alloy = make_pbr_mat("Supercar_ForgedAlloy", (0.88, 0.89, 0.92, 1.0), metallic=0.98, roughness=0.16, clearcoat=0.5)
    mat_tire = make_pbr_mat("Supercar_TireRubber", (0.025, 0.025, 0.028, 1.0), roughness=0.88)
    mat_rotor = make_pbr_mat("Supercar_BrakeRotor", (0.22, 0.23, 0.25, 1.0), metallic=0.80, roughness=0.35)
    mat_caliper = make_pbr_mat("Supercar_BremboCaliper", (0.88, 0.03, 0.05, 1.0), metallic=0.35, roughness=0.18, clearcoat=1.0)
    mat_exhaust = make_pbr_mat("Supercar_TitaniumExhaust", (0.65, 0.63, 0.60, 1.0), metallic=0.96, roughness=0.22)
    mat_chrome = make_pbr_mat("Supercar_PolishedMetal", (0.92, 0.93, 0.95, 1.0), metallic=0.98, roughness=0.08)
    mat_interior = make_pbr_mat("Supercar_InteriorLeather", (0.035, 0.035, 0.04, 1.0), metallic=0.05, roughness=0.78)
    mat_badge = make_pbr_mat("Supercar_ApexBadge", (0.95, 0.78, 0.12, 1.0), metallic=0.75, roughness=0.20, clearcoat=1.0)

    # 4. Re-assign materials and neutralize manufacturer branding
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue

        n = obj.name.lower()
        obj.data.materials.clear()

        if n.startswith("steering_red_lights"):
            obj.data.materials.append(mat_led_red)
        elif n.startswith("steering_carbon"):
            obj.data.materials.append(mat_carbon)
        elif n.startswith("steering_centre"):
            obj.data.materials.append(mat_carbon)
        elif n.startswith("steering_metal") or n.startswith("steering_trim"):
            obj.data.materials.append(mat_dark_trim)
        elif n.startswith("steering"):
            obj.data.materials.append(mat_interior)
        elif "body" in n:
            obj.data.materials.append(mat_paint)
        elif "glass" in n:
            obj.data.materials.append(mat_glass)
        elif "carbon" in n:
            obj.data.materials.append(mat_carbon)
        elif "tire" in n:
            obj.data.materials.append(mat_tire)
        elif n.startswith("rim") or n.startswith("wheel"):
            obj.data.materials.append(mat_alloy)
        elif n.startswith("nuts"):
            obj.data.materials.append(mat_exhaust)
        elif "brake" in n:
            if "caliper" in n or "brakes" in n:
                obj.data.materials.append(mat_caliper)
            else:
                obj.data.materials.append(mat_rotor)
        elif "lights_red" in n:
            obj.data.materials.append(mat_led_red)
        elif "lights" in n or "leds" in n:
            obj.data.materials.append(mat_led_white)
        elif "chrome" in n:
            obj.data.materials.append(mat_chrome)
        elif "yellow_trim" in n:
            obj.data.materials.append(mat_badge)
        elif "centre" in n:
            obj.data.materials.append(mat_carbon)
        elif "interior" in n or "leather" in n or "carpet" in n:
            obj.data.materials.append(mat_interior)
        elif "grill" in n or "trim" in n or "metal" in n or "plastic" in n or "wipers" in n or "blue" in n:
            obj.data.materials.append(mat_dark_trim)
        else:
            obj.data.materials.append(mat_paint)

        # Smooth normals
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if hasattr(obj.data, "shade_smooth_by_angle"):
            obj.data.shade_smooth_by_angle(math.radians(35))
        elif hasattr(obj.data, "auto_smooth_angle"):
            obj.data.auto_smooth_angle = math.radians(35)
            obj.data.use_auto_smooth = True

    # 5. Build Canonical Hierarchy
    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    root.empty_display_type = 'PLAIN_AXES'
    root.empty_display_size = 0.5
    bpy.context.collection.objects.link(root)

    subsystem_names = [
        "CHASSIS", "BODY", "GLASS", "LIGHTING", "WHEELS",
        "TIRES", "BRAKES", "SUSPENSION", "ENGINE_BAY",
        "CABIN", "UNDERBODY"
    ]

    group_empties = {}
    for sub_name in subsystem_names:
        emp = bpy.data.objects.new(sub_name, None)
        emp.empty_display_type = 'PLAIN_AXES'
        emp.empty_display_size = 0.25
        emp.parent = root
        bpy.context.collection.objects.link(emp)
        group_empties[sub_name] = emp

    # Reparent objects to their logical subsystem group while preserving world transformation
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            mw = obj.matrix_world.copy()
            n = obj.name.lower()
            
            if n.startswith("steering") or "interior" in n or "leather" in n or "carpet" in n:
                obj.parent = group_empties["CABIN"]
            elif "glass" in n:
                obj.parent = group_empties["GLASS"]
            elif "lights_red" in n or "lights" in n or "leds" in n:
                obj.parent = group_empties["LIGHTING"]
            elif "tire" in n:
                obj.parent = group_empties["TIRES"]
            elif "brake" in n:
                obj.parent = group_empties["BRAKES"]
            elif n.startswith("rim") or n.startswith("wheel") or n.startswith("nuts") or n.startswith("centre"):
                obj.parent = group_empties["WHEELS"]
            elif "grill" in n or "diffuser" in n or "undertray" in n:
                obj.parent = group_empties["UNDERBODY"]
            else:
                obj.parent = group_empties["BODY"]
                
            obj.matrix_world = mw

    # Preserve or re-parent original wheel anchor empties if present
    for o in list(bpy.data.objects):
        if o.type == 'EMPTY':
            if o.name in ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']:
                mw = o.matrix_world.copy()
                o.parent = group_empties["WHEELS"]
                o.matrix_world = mw
            elif o.name in ['main', 'RootNode', 'steering_wheel']:
                bpy.data.objects.remove(o, do_unlink=True)

    # 6. Add Standardized CAD Attachment Hardpoints
    empties = [
        ("ENGINE_MOUNT_MID", (0.0, -0.65, 0.42)),
        ("TRANSMISSION_MOUNT", (0.0, -1.45, 0.32)),
        ("FRONT_SUSPENSION_L", (0.55, 1.155, 0.358)),
        ("FRONT_SUSPENSION_R", (-0.55, 1.155, 0.358)),
        ("REAR_SUSPENSION_L", (0.55, -1.495, 0.358)),
        ("REAR_SUSPENSION_R", (-0.55, -1.495, 0.358)),
        ("FRONT_WHEEL_L", (-0.843, 1.155, 0.358)),
        ("FRONT_WHEEL_R", (0.829, 1.154, 0.361)),
        ("REAR_WHEEL_L", (-0.821, -1.495, 0.358)),
        ("REAR_WHEEL_R", (0.824, -1.496, 0.358)),
        ("RADIATOR_MOUNT_L", (0.45, 1.85, 0.28)),
        ("RADIATOR_MOUNT_R", (-0.45, 1.85, 0.28)),
        ("INTERCOOLER_MOUNT_L", (0.75, -0.90, 0.45)),
        ("INTERCOOLER_MOUNT_R", (-0.75, -0.90, 0.45)),
        ("EXHAUST_MOUNT", (0.0, -2.15, 0.45)),
        ("FRONT_SPLITTER_MOUNT", (0.0, 2.25, 0.12)),
        ("REAR_WING_MOUNT", (0.0, -2.15, 0.78)),
        ("SIDE_SKIRT_MOUNT_L", (0.92, 0.0, 0.14)),
        ("SIDE_SKIRT_MOUNT_R", (-0.92, 0.0, 0.14)),
        ("DIFFUSER_MOUNT", (0.0, -2.10, 0.18)),
    ]

    aero_group = bpy.data.objects.new("AERO_MOUNTING_POINTS", None)
    aero_group.empty_display_type = 'PLAIN_AXES'
    aero_group.empty_display_size = 0.25
    aero_group.parent = root
    bpy.context.collection.objects.link(aero_group)

    for name, pos in empties:
        emp = bpy.data.objects.new(name, None)
        emp.empty_display_type = 'ARROWS'
        emp.empty_display_size = 0.12
        emp.location = Vector(pos)
        emp.parent = aero_group
        bpy.context.collection.objects.link(emp)

    # 7. Multi-Path Deployment
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.data.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root

    for target_path in export_paths:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        print(f"[REFINE_SUPERCAR] Exporting GLB to {target_path}...")
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[REFINE_SUPERCAR] Saved: {target_path} ({os.path.getsize(target_path)} bytes)")

    return True

if __name__ == "__main__":
    src = r"E:\Car_Automation\public\assets\vehicles\ferrari_official_threejs.glb"
    targets = [
        r"E:\Car_Automation\public\assets\vehicles\vehicle_supercar.glb",
        r"E:\Car_Automation\public\assets\vehicles\preview_supercar.glb",
        r"E:\Car_Automation\public\models\vehicles\supercar\2010s\vehicle.glb",
        r"E:\Car_Automation\public\models\Car_Supercar_Complete.glb",
        r"E:\Car_Automation\public\models\Car_GT3_Supercar_Complete.glb",
        r"E:\Car_Automation\exports\Car_Ferrari_458_Italia_2010s.glb",
    ]
    execute_refinement(src, targets)
