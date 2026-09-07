"""
Automotive Interior PBR Material Factory and Mesh Enhancement Library for Blender 5.2 LTS.
Specialized for luxury executive, hypercar, and motorsport track cockpits.
"""

import bpy
import math
from mathutils import Vector, Matrix

def reset_scene():
    """Wipes the current scene clean of all objects, meshes, and materials."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def create_pbr_material(name, **kwargs):
    """
    Creates a Principled BSDF PBR material with Blender 4.x/5.x compatibility.
    Accepts:
      - base_color (tuple RGBA)
      - metallic (float)
      - roughness (float)
      - coat (float)
      - coat_roughness (float)
      - sheen (float)
      - sheen_roughness (float)
      - emission (tuple RGBA)
      - emission_strength (float)
      - transmission (float)
      - ior (float)
    """
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (300, 0)
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    
    # Helper to safely set socket value
    def set_socket(primary_name, alt_names, val):
        names = [primary_name] + alt_names
        for n in names:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = val
                return True
        return False
        
    if "base_color" in kwargs:
        set_socket("Base Color", [], kwargs["base_color"])
    if "metallic" in kwargs:
        set_socket("Metallic", [], kwargs["metallic"])
    if "roughness" in kwargs:
        set_socket("Roughness", [], kwargs["roughness"])
    if "ior" in kwargs:
        set_socket("IOR", [], kwargs["ior"])
        
    if "coat" in kwargs:
        set_socket("Coat Weight", ["Coat", "Clearcoat"], kwargs["coat"])
    if "coat_roughness" in kwargs:
        set_socket("Coat Roughness", ["Clearcoat Roughness"], kwargs["coat_roughness"])
        
    if "sheen" in kwargs:
        set_socket("Sheen Weight", ["Sheen"], kwargs["sheen"])
    if "sheen_roughness" in kwargs:
        set_socket("Sheen Roughness", [], kwargs["sheen_roughness"])
        
    if "emission" in kwargs:
        set_socket("Emission Color", ["Emission"], kwargs["emission"])
    if "emission_strength" in kwargs:
        set_socket("Emission Strength", [], kwargs["emission_strength"])
        
    if "transmission" in kwargs:
        set_socket("Transmission Weight", ["Transmission"], kwargs["transmission"])
        if kwargs["transmission"] > 0:
            mat.blend_method = 'BLEND'
            
    return mat

def get_interior_pbr_suite():
    """Returns a complete dictionary of curated automotive interior PBR shaders."""
    return {
        # 1. Nappa Leather (Obsidian Black)
        "nappa_leather_black": create_pbr_material(
            "MAT_Int_Nappa_Black",
            base_color=(0.04, 0.042, 0.048, 1.0),
            metallic=0.0,
            roughness=0.42,
            sheen=0.45,
            sheen_roughness=0.5
        ),
        # 2. Cognac Saddle Tan Leather
        "leather_cognac": create_pbr_material(
            "MAT_Int_Leather_Cognac",
            base_color=(0.38, 0.18, 0.08, 1.0),
            metallic=0.0,
            roughness=0.36,
            sheen=0.5,
            sheen_roughness=0.45
        ),
        # 3. Oxblood Red Leather
        "leather_oxblood": create_pbr_material(
            "MAT_Int_Leather_Oxblood",
            base_color=(0.28, 0.04, 0.05, 1.0),
            metallic=0.0,
            roughness=0.38,
            sheen=0.4,
            sheen_roughness=0.5
        ),
        # 4. Perforated Sport Leather
        "perforated_leather": create_pbr_material(
            "MAT_Int_Leather_Perforated",
            base_color=(0.06, 0.065, 0.075, 1.0),
            metallic=0.0,
            roughness=0.48,
            sheen=0.3
        ),
        # 5. Alcantara / Ultra-Suede (Charcoal Anthracite)
        "alcantara_suede": create_pbr_material(
            "MAT_Int_Alcantara_Charcoal",
            base_color=(0.08, 0.085, 0.095, 1.0),
            metallic=0.0,
            roughness=0.78,
            sheen=0.85,
            sheen_roughness=0.7
        ),
        # 6. High-Gloss 2x2 Twill Carbon Fiber
        "carbon_twill_gloss": create_pbr_material(
            "MAT_Int_Carbon_Twill_Gloss",
            base_color=(0.03, 0.032, 0.035, 1.0),
            metallic=0.15,
            roughness=0.06,
            coat=1.0,
            coat_roughness=0.03
        ),
        # 7. Satin Matte Forged Carbon Fiber
        "carbon_forged_matte": create_pbr_material(
            "MAT_Int_Carbon_Forged_Matte",
            base_color=(0.05, 0.052, 0.055, 1.0),
            metallic=0.1,
            roughness=0.28,
            coat=0.6,
            coat_roughness=0.2
        ),
        # 8. Brushed Billet Aluminum / Titanium Trim
        "brushed_aluminum": create_pbr_material(
            "MAT_Int_Brushed_Aluminum",
            base_color=(0.88, 0.90, 0.92, 1.0),
            metallic=0.96,
            roughness=0.20
        ),
        # 9. Jewel-Cut Mirror Chrome
        "jewel_chrome": create_pbr_material(
            "MAT_Int_Jewel_Chrome",
            base_color=(0.95, 0.96, 0.98, 1.0),
            metallic=1.0,
            roughness=0.02
        ),
        # 10. Deep Piano Black Lacquer
        "piano_black": create_pbr_material(
            "MAT_Int_Piano_Black",
            base_color=(0.015, 0.015, 0.018, 1.0),
            metallic=0.0,
            roughness=0.02,
            coat=1.0,
            coat_roughness=0.01
        ),
        # 11. Open-Pore Walnut Luxury Wood
        "wood_walnut": create_pbr_material(
            "MAT_Int_Wood_Walnut",
            base_color=(0.14, 0.08, 0.045, 1.0),
            metallic=0.0,
            roughness=0.35,
            coat=0.3
        ),
        # 12. OLED Digital Display & Hyperscreen Glass
        "oled_display_glass": create_pbr_material(
            "MAT_Int_OLED_Display",
            base_color=(0.01, 0.015, 0.03, 1.0),
            metallic=0.05,
            roughness=0.04,
            coat=1.0,
            coat_roughness=0.02,
            emission=(0.15, 0.45, 0.85, 1.0),
            emission_strength=1.5
        ),
        # 13. Ambient LED Light Piping (Neon Cyan)
        "ambient_led_cyan": create_pbr_material(
            "MAT_Int_LED_Cyan",
            base_color=(0.0, 0.85, 1.0, 1.0),
            metallic=0.0,
            roughness=0.1,
            emission=(0.0, 0.9, 1.0, 1.0),
            emission_strength=6.0
        ),
        # 14. Ambient LED Light Piping (Warm Gold / Amber)
        "ambient_led_amber": create_pbr_material(
            "MAT_Int_LED_Amber",
            base_color=(1.0, 0.65, 0.15, 1.0),
            metallic=0.0,
            roughness=0.1,
            emission=(1.0, 0.68, 0.15, 1.0),
            emission_strength=6.0
        ),
        # 15. Ambient LED Light Piping (Crimson Red / GT3)
        "ambient_led_crimson": create_pbr_material(
            "MAT_Int_LED_Crimson",
            base_color=(1.0, 0.08, 0.15, 1.0),
            metallic=0.0,
            roughness=0.1,
            emission=(1.0, 0.1, 0.18, 1.0),
            emission_strength=6.5
        ),
        # 16. Acoustic Tufted Floor Carpet
        "carpet_tufted": create_pbr_material(
            "MAT_Int_Carpet_Tufted",
            base_color=(0.025, 0.026, 0.03, 1.0),
            metallic=0.0,
            roughness=0.92
        ),
        # 17. Crystal Glass Rotary Controller
        "crystal_glass": create_pbr_material(
            "MAT_Int_Crystal_Glass",
            base_color=(0.95, 0.98, 1.0, 1.0),
            metallic=0.0,
            roughness=0.04,
            transmission=0.92,
            ior=1.54,
            coat=1.0
        ),
        # 18. Contrast Racing Stitching (Vibrant Cyan / Amber)
        "contrast_stitching": create_pbr_material(
            "MAT_Int_Contrast_Stitch",
            base_color=(0.1, 0.7, 0.95, 1.0),
            metallic=0.0,
            roughness=0.65
        ),
        # 19. Sabelt / Schroth Harness Webbing (Racing Red)
        "harness_webbing": create_pbr_material(
            "MAT_Int_Harness_Webbing",
            base_color=(0.85, 0.06, 0.08, 1.0),
            metallic=0.0,
            roughness=0.55,
            sheen=0.35
        ),
        # 20. Rubber Tactile Grip (Pedals, Thumbwheels, Knobs)
        "rubber_tactile": create_pbr_material(
            "MAT_Int_Rubber_Tactile",
            base_color=(0.035, 0.035, 0.038, 1.0),
            metallic=0.0,
            roughness=0.72
        )
    }

def classify_interior_material(obj, mat_suite):
    """
    Intelligently determines the appropriate PBR material for a mesh
    based on its object name, mesh name, and existing material names.
    """
    name = (obj.name + " " + obj.data.name).lower()
    existing_mat_names = " ".join(slot.material.name.lower() if slot.material else "" for slot in obj.material_slots)
    combined = f"{name} {existing_mat_names}"

    # Ambient LED guides
    if any(k in combined for k in ["ambient", "led", "light_guide", "starlight", "neon", "fiber_optic"]):
        if "amber" in combined or "gold" in combined or "warm" in combined:
            return mat_suite["ambient_led_amber"]
        elif "red" in combined or "crimson" in combined or "gt3" in combined or "sport" in combined:
            return mat_suite["ambient_led_crimson"]
        else:
            return mat_suite["ambient_led_cyan"]

    # Screens & OLED Displays
    if any(k in combined for k in ["screen", "display", "hyperscreen", "cluster", "hud", "monitor", "gauge", "telemetry", "tablet", "theater"]):
        return mat_suite["oled_display_glass"]

    # Carbon Fiber
    if any(k in combined for k in ["carbon", "twill", "monocoque", "bucket_shell", "yoke_core", "diffuser_tunnel"]):
        if "forged" in combined or "matte" in combined:
            return mat_suite["carbon_forged_matte"]
        return mat_suite["carbon_twill_gloss"]

    # Crystal Glass
    if any(k in combined for k in ["crystal", "rotary_dial", "monostable", "jewel_knob"]):
        return mat_suite["crystal_glass"]

    # Chrome & Metallic Accents
    if any(k in combined for k in ["chrome", "bezel", "knurled", "watchmaker", "roller", "jewel", "mirror_trim"]):
        return mat_suite["jewel_chrome"]

    # Brushed Aluminum & Titanium
    if any(k in combined for k in ["aluminum", "titanium", "pedal", "paddle", "lever", "bracket", "speaker_grille", "switch", "button", "bolt", "hardware"]):
        return mat_suite["brushed_aluminum"]

    # Piano Black
    if any(k in combined for k in ["piano", "gloss_black", "lacquer", "fascia_center", "bezel_black"]):
        return mat_suite["piano_black"]

    # Luxury Wood
    if any(k in combined for k in ["wood", "walnut", "timber", "veneer", "ash", "oak"]):
        return mat_suite["wood_walnut"]

    # Alcantara
    if any(k in combined for k in ["alcantara", "suede", "headliner", "sun_visor", "pillar_trim", "wheel_grip"]):
        return mat_suite["alcantara_suede"]

    # Harness Webbing
    if any(k in combined for k in ["harness", "seatbelt", "belt_strap", "pull_strap"]):
        return mat_suite["harness_webbing"]

    # Rubber Grips
    if any(k in combined for k in ["rubber", "tread", "pad_grip", "weatherstrip", "gasket", "seal"]):
        return mat_suite["rubber_tactile"]

    # Carpet
    if any(k in combined for k in ["carpet", "floor_mat", "underfoot", "footrest_carpet"]):
        return mat_suite["carpet_tufted"]

    # Leathers
    if any(k in combined for k in ["perforated", "breathable", "seat_insert", "cushion_center"]):
        return mat_suite["perforated_leather"]
    if any(k in combined for k in ["cognac", "tan", "brown", "saddle", "caramel"]):
        return mat_suite["leather_cognac"]
    if any(k in combined for k in ["oxblood", "burgundy", "red_leather", "wine"]):
        return mat_suite["leather_oxblood"]

    # Default to Nappa leather for cabin surfaces
    return mat_suite["nappa_leather_black"]

def apply_mesh_enhancements(obj, mat_suite):
    """
    Applies smooth shading, weighted normal modifier, and PBR material to a mesh object.
    Uses safe slot assignment syntax to prevent RNA collection faults.
    """
    if obj.type != 'MESH' or not obj.data:
        return

    mesh = obj.data

    # 1. Enable Smooth Shading across all polygon faces
    mesh.polygons.foreach_set('use_smooth', [True] * len(mesh.polygons))

    # 2. Add Weighted Normal Modifier for crisp CAD bevel highlights
    mod_name = "Auto_WeightedNormal"
    if mod_name not in obj.modifiers:
        wn_mod = obj.modifiers.new(name=mod_name, type='WEIGHTED_NORMAL')
        wn_mod.keep_sharp = True
        wn_mod.weight = 80

    # 3. Classify and apply PBR material
    target_mat = classify_interior_material(obj, mat_suite)

    if len(obj.material_slots) == 0:
        obj.data.materials.append(target_mat)
    else:
        for slot in obj.material_slots:
            slot.material = target_mat

    mesh.update()
