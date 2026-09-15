"""
==============================================================================
APEX SIMULATOR: REFINE & HUMANIZE FLAGSHIP SUPERCAR PLATFORM (BLENDER 5.2)
==============================================================================
Loads the reference mid-engine Berlinetta architecture, upgrades it to
Apex engineering standards:
1. Re-shades and neutralizes copyrighted manufacturer badges into Apex carbon/titanium.
2. Applies master PBR automotive shaders:
   - Rosso Corsa Metallic Paint with Dual Clearcoat
   - 2x2 Twill High-Gloss Carbon Fiber
   - Optical Dielectric Automotive Glass
   - High-intensity Projector LEDs & Red OLED Taillights
   - Diamond-Cut Alloy Rims & Semi-Slick Rubber
   - Carbon-Ceramic Ventilated Rotors & Rosso Calipers
   - Titanium / Inconel Exhaust
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
   └── ATTACHMENT_POINTS (standardized CAD hardpoints)
4. Adds standardized empty attachment points:
   ENGINE_MOUNT_MID, TRANSMISSION_MOUNT, AERO_MOUNT_POINTS, etc.
5. Dual-mode export:
   - /public/assets/vehicles/vehicle_supercar.glb
   - /public/assets/vehicles/preview_supercar.glb
   - /public/models/Car_GT3_Supercar_Complete.glb
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

    if transmission > 0 or alpha < 1.0:
        mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else None

    return mat

def execute_refinement(source_glb, output_glb, preview_glb=None, legacy_glb=None):
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
    mat_carbon = make_pbr_mat("Supercar_CarbonFiber", (0.04, 0.04, 0.05, 1.0), metallic=0.15, roughness=0.18, clearcoat=0.95)
    mat_dark_trim = make_pbr_mat("Supercar_SatinTrim", (0.06, 0.06, 0.07, 1.0), metallic=0.40, roughness=0.45)
    mat_glass = make_pbr_mat("Supercar_Glass_Dielectric", (0.85, 0.90, 0.95, 0.30), roughness=0.02, transmission=0.94, alpha=0.30, ior=1.52)
    mat_led_white = make_pbr_mat("Supercar_LED_White", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=25.0)
    mat_led_red = make_pbr_mat("Supercar_LED_Red", (1.0, 0.02, 0.02, 1.0), emission=(1.0, 0.01, 0.02, 1.0), emission_strength=20.0)
    mat_alloy = make_pbr_mat("Supercar_ForgedAlloy", (0.88, 0.89, 0.92, 1.0), metallic=0.98, roughness=0.18, clearcoat=0.5)
    mat_tire = make_pbr_mat("Supercar_TireRubber", (0.025, 0.025, 0.028, 1.0), roughness=0.86)
    mat_rotor = make_pbr_mat("Supercar_BrakeRotor", (0.28, 0.29, 0.30, 1.0), metallic=0.85, roughness=0.32)
    mat_caliper = make_pbr_mat("Supercar_BremboCaliper", (0.92, 0.02, 0.04, 1.0), metallic=0.35, roughness=0.20, clearcoat=1.0)
    mat_exhaust = make_pbr_mat("Supercar_TitaniumExhaust", (0.58, 0.55, 0.52, 1.0), metallic=0.96, roughness=0.25)
    mat_interior = make_pbr_mat("Supercar_InteriorDark", (0.05, 0.05, 0.06, 1.0), metallic=0.08, roughness=0.75)

    # 4. Re-assign materials and neutralize manufacturer branding
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue

        n = obj.name.lower()
        if "body" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_paint)
        elif "glass" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_glass)
        elif "carbon" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_carbon)
        elif "tire" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_tire)
        elif "rim" in n or "wheel" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_alloy)
        elif "brake" in n:
            obj.data.materials.clear()
            # If caliper vs rotor
            if "caliper" in n or "brakes" in n:
                obj.data.materials.append(mat_caliper)
            else:
                obj.data.materials.append(mat_rotor)
        elif "lights_red" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_led_red)
        elif "lights" in n or "leds" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_led_white)
        elif "grill" in n or "trim" in n or "metal" in n or "plastic" in n or "wipers" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_dark_trim)
        elif "centre" in n or "yellow" in n or "blue" in n:
            # Neutralize logos/badges into technical carbon / apex dark titanium
            obj.data.materials.clear()
            obj.data.materials.append(mat_carbon)
        elif "interior" in n or "leather" in n or "carpet" in n or "steering" in n:
            obj.data.materials.clear()
            obj.data.materials.append(mat_interior)

        # Smooth normals
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if hasattr(obj.data, "shade_smooth_by_angle"):
            obj.data.shade_smooth_by_angle(math.radians(35))
        elif hasattr(obj.data, "auto_smooth_angle"):
            obj.data.auto_smooth_angle = math.radians(35)
            obj.data.use_auto_smooth = True

    # 5. Build Canonical Hierarchy
    # VEHICLE_ROOT
    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    root.empty_display_type = 'PLAIN_AXES'
    root.empty_display_size = 0.5
    bpy.context.collection.objects.link(root)

    # Subsystem Groups
    subsystems = {
        "CHASSIS": ["chassis", "monocoque", "subframe", "tub"],
        "BODY": ["body", "hood", "door", "fender", "bumper", "roof", "haunch", "quarter"],
        "GLASS": ["glass", "windshield", "window"],
        "LIGHTING": ["light", "led", "lamp"],
        "WHEELS": ["wheel", "rim"],
        "TIRES": ["tire"],
        "BRAKES": ["brake", "rotor", "caliper"],
        "SUSPENSION": ["suspension", "wishbone", "spring"],
        "ENGINE_BAY": ["engine", "powertrain", "intake"],
        "CABIN": ["interior", "steering", "leather", "carpet", "seat"],
        "UNDERBODY": ["diffuser", "undertray", "splitter", "skirt", "grill"],
    }

    group_empties = {}
    for sub_name in subsystems.keys():
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
            assigned = False
            for sub_name, keywords in subsystems.items():
                if any(kw in n for kw in keywords):
                    obj.parent = group_empties[sub_name]
                    assigned = True
                    break
            if not assigned:
                obj.parent = group_empties["BODY"]
            obj.matrix_world = mw

    # Remove stale imported empties (e.g. 'main', 'RootNode') that are now empty
    for o in list(bpy.data.objects):
        if o.type == 'EMPTY' and o.name in ['main', 'RootNode', 'steering_wheel']:
            bpy.data.objects.remove(o, do_unlink=True)

    # 6. Add Standardized CAD Attachment Hardpoints
    empties = [
        ("ENGINE_MOUNT_MID", (0.0, -0.92, 0.35)),
        ("TRANSMISSION_MOUNT", (0.0, -1.45, 0.28)),
        ("FRONT_SUSPENSION_L", (0.50, 1.30, 0.28)),
        ("FRONT_SUSPENSION_R", (-0.50, 1.30, 0.28)),
        ("REAR_SUSPENSION_L", (0.48, -1.30, 0.28)),
        ("REAR_SUSPENSION_R", (-0.48, -1.30, 0.28)),
        ("FRONT_WHEEL_L", (0.8325, 1.300, 0.340)),
        ("FRONT_WHEEL_R", (-0.8325, 1.300, 0.340)),
        ("REAR_WHEEL_L", (0.8160, -1.300, 0.355)),
        ("REAR_WHEEL_R", (-0.8160, -1.300, 0.355)),
        ("RADIATOR_MOUNT_L", (0.45, 1.85, 0.32)),
        ("RADIATOR_MOUNT_R", (-0.45, 1.85, 0.32)),
        ("INTERCOOLER_MOUNT_L", (0.78, -0.85, 0.45)),
        ("INTERCOOLER_MOUNT_R", (-0.78, -0.85, 0.45)),
        ("EXHAUST_MOUNT", (0.0, -2.15, 0.62)),
        ("FRONT_SPLITTER_MOUNT", (0.0, 2.15, 0.12)),
        ("REAR_WING_MOUNT", (0.0, -2.05, 0.85)),
        ("SIDE_SKIRT_MOUNT_L", (0.92, 0.0, 0.14)),
        ("SIDE_SKIRT_MOUNT_R", (-0.92, 0.0, 0.14)),
        ("DIFFUSER_MOUNT", (0.0, -1.95, 0.15)),
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

    # 7. Export GLBs
    os.makedirs(os.path.dirname(output_glb), exist_ok=True)

    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.data.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root

    print(f"[REFINE_SUPERCAR] Exporting master GLB to {output_glb}...")
    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
    )
    print(f"[REFINE_SUPERCAR] Master GLB created: {output_glb} ({os.path.getsize(output_glb)} bytes)")

    if legacy_glb:
        os.makedirs(os.path.dirname(legacy_glb), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=legacy_glb,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[REFINE_SUPERCAR] Overwrote legacy GT3 model: {legacy_glb}")

    if preview_glb:
        os.makedirs(os.path.dirname(preview_glb), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=preview_glb,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[REFINE_SUPERCAR] Preview GLB created: {preview_glb}")

    return output_glb

if __name__ == "__main__":
    src = r"E:\Car_Automation\public\assets\vehicles\ferrari_official_threejs.glb"
    out = r"E:\Car_Automation\public\assets\vehicles\vehicle_supercar.glb"
    prev = r"E:\Car_Automation\public\assets\vehicles\preview_supercar.glb"
    leg = r"E:\Car_Automation\public\models\Car_GT3_Supercar_Complete.glb"
    execute_refinement(src, out, prev, leg)
