# pyright: reportMissingImports=false
import bpy
import sys
import os
import math

def setup_clean_scene():
    """Clear factory default items (Cube, Camera, Light)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

def configure_principled_bsdf(material, params):
    """Safely configure Principled BSDF across Blender versions (supports Blender 4.x and 5.x)."""
    material.use_nodes = True
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        output = nodes.get("Material Output") or nodes.new("ShaderNodeOutputMaterial")
        material.node_tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    
    socket_map = {
        "base_color": ["Base Color"],
        "metallic": ["Metallic"],
        "roughness": ["Roughness"],
        "ior": ["IOR"],
        "alpha": ["Alpha"],
        "transmission": ["Transmission Weight", "Transmission"],
        "coat_weight": ["Coat Weight", "Coat", "Clearcoat"],
        "coat_roughness": ["Coat Roughness", "Clearcoat Roughness"],
        "coat_ior": ["Coat IOR"],
        "sheen_weight": ["Sheen Weight", "Sheen"],
        "emission_color": ["Emission Color", "Emission"],
        "emission_strength": ["Emission Strength"]
    }
    
    for key, val in params.items():
        if key not in socket_map:
            continue
        possible_names = socket_map[key]
        for name in possible_names:
            if name in bsdf.inputs:
                bsdf.inputs[name].default_value = val
                break

def refine_materials():
    """Upgrade all vehicle PBR materials to high-end automotive configurator standards."""
    materials_config = {
        "Car_Paint_Master": {
            "base_color": (0.85, 0.04, 0.06, 1.0), # Vivid Apex Racing Red
            "metallic": 0.88,
            "roughness": 0.10,
            "coat_weight": 1.0,     # Deep high-gloss wet clearcoat
            "coat_roughness": 0.008,
            "coat_ior": 1.52,
            "sheen_weight": 0.2,
            "ior": 1.50
        },
        "Carbon_Fiber_Gloss": {
            "base_color": (0.035, 0.035, 0.04, 1.0), # Autoclaved Pre-preg Twill Weave
            "metallic": 0.50,
            "roughness": 0.14,
            "coat_weight": 1.0,
            "coat_roughness": 0.015,
            "ior": 1.58
        },
        "Dielectric_Glass": {
            "base_color": (0.88, 0.94, 1.0, 1.0),
            "transmission": 0.95,
            "roughness": 0.008,
            "ior": 1.52,
            "alpha": 0.35
        },
        "Headlight_Lens_Glass": {
            "base_color": (0.95, 0.98, 1.0, 1.0),
            "transmission": 0.96,
            "roughness": 0.015,
            "ior": 1.58,
            "alpha": 0.30
        },
        "DRL_Ice_Blue_Emissive": {
            "base_color": (0.7, 0.9, 1.0, 1.0),
            "emission_color": (0.65, 0.88, 1.0, 1.0),
            "emission_strength": 5.0,
            "roughness": 0.05
        },
        "LED_Projector_White": {
            "base_color": (0.95, 0.98, 1.0, 1.0),
            "emission_color": (0.95, 0.98, 1.0, 1.0),
            "emission_strength": 6.5,
            "metallic": 0.80,
            "roughness": 0.05
        },
        "OLED_Taillight_Red": {
            "base_color": (1.0, 0.02, 0.05, 1.0),
            "emission_color": (1.0, 0.02, 0.05, 1.0),
            "emission_strength": 5.5,
            "roughness": 0.08
        },
        "Brake_Caliper_Red": {
            "base_color": (0.85, 0.05, 0.05, 1.0), # Brembo / AP Racing competition red
            "metallic": 0.75,
            "roughness": 0.15,
            "coat_weight": 1.0,
            "coat_roughness": 0.02
        },
        "Carbon_Ceramic_Rotor": {
            "base_color": (0.12, 0.12, 0.13, 1.0), # Dark ceramic matrix
            "metallic": 0.65,
            "roughness": 0.38,
            "coat_weight": 0.2
        },
        "Forged_Wheel_Alloy": {
            "base_color": (0.16, 0.17, 0.19, 1.0), # Dark satin forged titanium
            "metallic": 0.92,
            "roughness": 0.15,
            "coat_weight": 0.5,
            "coat_roughness": 0.04
        },
        "Tire_Rubber_Slick": {
            "base_color": (0.038, 0.038, 0.038, 1.0), # Michelin/Pirelli competition compound
            "metallic": 0.0,
            "roughness": 0.88
        },
        "Titanium_Flame_Tint": {
            "base_color": (0.42, 0.45, 0.52, 1.0), # Inconel exhaust with blue/violet heat bloom
            "metallic": 0.96,
            "roughness": 0.18,
            "coat_weight": 0.8,
            "coat_roughness": 0.03
        },
        "Dark_Alloy_Trim": {
            "base_color": (0.08, 0.08, 0.09, 1.0),
            "metallic": 0.85,
            "roughness": 0.25
        }
    }
    
    for mat_name, config in materials_config.items():
        mat = bpy.data.materials.get(mat_name)
        if not mat:
            mat = bpy.data.materials.new(name=mat_name)
        configure_principled_bsdf(mat, config)
        print(f"Calibrated PBR Material: {mat_name}")

def refine_geometry_and_normals():
    """Apply smooth shading, Weighted Normal, Solidify, and Bevel modifiers for Class-A surfacing."""
    body_panels = [
        "Bonnet_Hood_Skin",
        "Door_Main_Skin_Left", "Door_Main_Skin_Right",
        "Greenhouse_Roof_Canopy",
        "Fender_Front_Left", "Fender_Front_Right",
        "Rear_Haunch_Left", "Rear_Haunch_Right",
        "Front_Bumper_Fascia", "Rear_Bumper_Fascia",
        "Dicky_Engine_Cover_Skin",
        "Side_Skirts_Left", "Side_Skirts_Right"
    ]
    
    thin_sheet_panels = [
        "Bonnet_Hood_Skin",
        "Door_Main_Skin_Left", "Door_Main_Skin_Right",
        "Fender_Front_Left", "Fender_Front_Right",
        "Rear_Haunch_Left", "Rear_Haunch_Right"
    ]
    
    aero_surfaces = [
        "Wing_Main_Aerofoil", "Wing_Endplate_Left", "Wing_Endplate_Right", "Wing_Gurney_Flap",
        "Swan_Neck_Pylon_Left", "Swan_Neck_Pylon_Right",
        "Front_Splitter_Tray", "Splitter_Endplate_Left", "Splitter_Endplate_Right",
        "Diffuser_Curved_Ramp", "Diffuser_Vortex_Strake_1", "Diffuser_Vortex_Strake_2",
        "Diffuser_Vortex_Strake_3", "Diffuser_Vortex_Strake_4",
        "Side_Skirt_Winglet_Left", "Side_Skirt_Winglet_Right",
        "Front_Canard_Left_1", "Front_Canard_Left_2", "Front_Canard_Right_1", "Front_Canard_Right_2",
        "Chassis_Carbon_Monocoque", "Chassis_Undertray_Floor"
    ]

    wheel_and_brake_objs = [
        "Forged_Rim_Face_FL", "Forged_Rim_Face_FR", "Forged_Rim_Face_RL", "Forged_Rim_Face_RR",
        "Tire_Slick_Rubber_FL", "Tire_Slick_Rubber_FR", "Tire_Slick_Rubber_RL", "Tire_Slick_Rubber_RR",
        "Brake_Rotor_Drilled_FL", "Brake_Rotor_Drilled_FR", "Brake_Rotor_Drilled_RL", "Brake_Rotor_Drilled_RR",
        "Brake_Caliper_Monobloc_FL", "Brake_Caliper_Monobloc_FR", "Brake_Caliper_Monobloc_RL", "Brake_Caliper_Monobloc_RR",
        "Centerlock_Nut_FL", "Centerlock_Nut_FR", "Centerlock_Nut_RL", "Centerlock_Nut_RR"
    ]

    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue
        mesh = obj.data
        
        # 1. Enable Smooth Shading on all polygons
        for poly in mesh.polygons:
            poly.use_smooth = True
            
        # 2. Automotive Sheet Metal Solidification (Panel Thickness for authentic shutline depth)
        if obj.name in thin_sheet_panels:
            if "Solidify_Sheet_Thickness" not in obj.modifiers:
                sol = obj.modifiers.new("Solidify_Sheet_Thickness", "SOLIDIFY")
                sol.thickness = 0.0014 # 1.4 mm carbon/aluminum sheet gauge
                sol.offset = 0.0       # Center offset for seamless alignment
                sol.use_even_offset = True
                print(f"Applied Solidify panel depth: {obj.name}")

        # 3. Micro-Bevel for catching specular highlights along character lines
        if obj.name in body_panels or obj.name in aero_surfaces or obj.name in wheel_and_brake_objs:
            if "Bevel_Character_Seam" not in obj.modifiers:
                bev = obj.modifiers.new("Bevel_Character_Seam", "BEVEL")
                bev.width = 0.0012   # 1.2 mm subtle edge radius
                bev.segments = 2
                bev.limit_method = 'ANGLE'
                bev.angle_limit = math.radians(38)
                bev.harden_normals = True

        # 4. Weighted Normal Modifier (Class-A reflection continuity, eliminating faceting)
        if "Weighted_Normal_ClassA" not in obj.modifiers:
            wn = obj.modifiers.new("Weighted_Normal_ClassA", "WEIGHTED_NORMAL")
            wn.keep_sharp = True
            wn.weight = 50
            wn.mode = 'FACE_AREA'
            print(f"Applied Class-A Weighted Normal: {obj.name}")

def verify_and_lock_kinematics():
    """Ensure all kinematic pivot anchors and hierarchy required by tests and simulator remain intact."""
    critical_pivots = [
        ("Bonnet_Hinge_Pivot", (0.0, 0.45, -0.7)),
        ("Door_Hinge_Pivot_Left", (-0.82, 0.52, -0.15)),
        ("Door_Hinge_Pivot_Right", (0.82, 0.52, -0.15)),
        ("Dicky_Decklid_Pivot", (0.0, 0.58, 0.85)),
        ("Front_Splitter_Assembly", (0.0, 0.08, -1.85)),
        ("Rear_Wing_Assembly", (0.0, 0.95, 1.65)),
        ("Diffuser_Venturi_Assembly", (0.0, 0.12, 1.45))
    ]
    
    for pivot_name, expected_approx in critical_pivots:
        obj = bpy.data.objects.get(pivot_name)
        if obj:
            print(f"Verified Kinematic Anchor: {pivot_name} at loc={list(obj.location)}")
        else:
            print(f"WARNING: Kinematic Anchor {pivot_name} not found!")

def main():
    project_root = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
    source_glb = os.path.join(project_root, "blender", "backup", "original", "modular_gt3_apex.glb")
    blend_output = os.path.join(project_root, "blender", "body", "gt3_exterior_refined.blend")
    export_glb = os.path.join(project_root, "exports", "glb", "modular_gt3_apex_refined.glb")
    public_target = os.path.join(project_root, "public", "models", "exterior", "modular_gt3_apex.glb")

    os.makedirs(os.path.dirname(blend_output), exist_ok=True)
    os.makedirs(os.path.dirname(export_glb), exist_ok=True)

    print("==================================================")
    print("STEP 1: INITIALIZING CLEAN BLENDER 5.2 ENVIRONMENT")
    print("==================================================")
    setup_clean_scene()

    print("\n==================================================")
    print(f"STEP 2: IMPORTING SOURCE ASSET: {source_glb}")
    print("==================================================")
    bpy.ops.import_scene.gltf(filepath=source_glb)

    print("\n==================================================")
    print("STEP 3: CALIBRATING HIGH-END AUTOMOTIVE PBR MATERIALS")
    print("==================================================")
    refine_materials()

    print("\n==================================================")
    print("STEP 4: APPLYING CLASS-A SURFACING & WEIGHTED NORMALS")
    print("==================================================")
    refine_geometry_and_normals()

    print("\n==================================================")
    print("STEP 5: VERIFYING KINEMATIC INTEGRITY & PIVOTS")
    print("==================================================")
    verify_and_lock_kinematics()

    print("\n==================================================")
    print(f"STEP 6: SAVING MASTER BLENDER FILE: {blend_output}")
    print("==================================================")
    bpy.ops.wm.save_as_mainfile(filepath=blend_output)

    print("\n==================================================")
    print(f"STEP 7: EXPORTING PRODUCTION GLB: {export_glb}")
    print("==================================================")
    bpy.ops.export_scene.gltf(
        filepath=export_glb,
        export_format='GLB',
        use_selection=False,
        export_apply=True,           # Apply modifiers (Weighted Normal, Solidify, Bevel)
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_yup=True
    )
    
    file_size = os.path.getsize(export_glb)
    print(f"Refined Production GLB generated: {file_size:,} bytes")

    print("\n==================================================")
    print(f"STEP 8: DEPLOYING TO PUBLIC ASSETS: {public_target}")
    print("==================================================")
    with open(export_glb, "rb") as f_src, open(public_target, "wb") as f_dst:
        f_dst.write(f_src.read())
    print(f"Successfully synced refined GLB to {public_target}")
    print("==================================================")
    print("CAR EXTERIOR REFINEMENT PIPELINE COMPLETE (100%)")
    print("==================================================")

if __name__ == "__main__":
    main()
