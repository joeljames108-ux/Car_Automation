"""
Hilux Dual-Mode GLB Serialization & Export Engine (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Exports unified complete vehicle GLB and modular zero-offset component GLBs to:
- public/models/Car_HiLux_SR5_Complete.glb
- exports/Car_HiLux_SR5_Complete.glb
- public/models/modular_parts/hilux_*.glb
- exports/parts/hilux_*.glb
"""

import bpy
import os
import shutil

ROOT_DIR = r"E:\Car_Automation"
PUBLIC_MODELS = os.path.join(ROOT_DIR, "public", "models")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports")
PUBLIC_PARTS = os.path.join(PUBLIC_MODELS, "modular_parts")
EXPORTS_PARTS = os.path.join(EXPORTS_DIR, "parts")

os.makedirs(PUBLIC_MODELS, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(PUBLIC_PARTS, exist_ok=True)
os.makedirs(EXPORTS_PARTS, exist_ok=True)

def export_all_glbs():
    """Export complete vehicle and individual zero-offset modular components."""
    print("[HILUX] Starting Dual-Mode GLB Export...")
    
    # Ensure all objects are visible and selectable
    for obj in bpy.data.objects:
        obj.hide_viewport = False
        obj.hide_render = False
        obj.select_set(False)
        
    # 1. Export Complete Vehicle GLB
    complete_public = os.path.join(PUBLIC_MODELS, "Car_HiLux_SR5_Complete.glb")
    complete_export = os.path.join(EXPORTS_DIR, "Car_HiLux_SR5_Complete.glb")
    
    # Select all mesh objects
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            
    bpy.ops.export_scene.gltf(
        filepath=complete_public,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True
    )
    print(f"[HILUX] Exported Complete Vehicle to: {complete_public}")
    
    # Duplicate to exports/
    shutil.copyfile(complete_public, complete_export)
    print(f"[HILUX] Mirrored to: {complete_export}")
    
    # 2. Export Modular Zero-Offset Component GLBs
    collections_to_export = [
        ("01_Chassis_Frame", "hilux_chassis_frame.glb"),
        ("02_Cab_Body", "hilux_cab_body.glb"),
        ("03_Cargo_Bed", "hilux_cargo_bed.glb"),
        ("04_Front_Fascia_Lighting", "hilux_front_fascia.glb"),
        ("05_Rear_Fascia_Lighting", "hilux_rear_fascia.glb"),
        ("06_Exterior_Hardware", "hilux_exterior_hardware.glb"),
        ("07_Greenhouse_Glazing", "hilux_greenhouse_glazing.glb"),
        ("08_Suspension_Brakes", "hilux_suspension.glb"),
        ("09_Wheels_Tires", "hilux_wheels_tires.glb"),
        ("10_Powertrain_Interior", "hilux_powertrain_interior.glb"),
    ]
    
    for col_name, filename in collections_to_export:
        col = bpy.data.collections.get(col_name)
        if not col:
            continue
            
        # Deselect all
        for obj in bpy.data.objects:
            obj.select_set(False)
            
        # Select objects in this collection only
        count = 0
        for obj in col.all_objects:
            if obj.type == 'MESH':
                obj.select_set(True)
                count += 1
                
        if count == 0:
            continue
            
        part_public = os.path.join(PUBLIC_PARTS, filename)
        part_export = os.path.join(EXPORTS_PARTS, filename)
        
        bpy.ops.export_scene.gltf(
            filepath=part_public,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True
        )
        shutil.copyfile(part_public, part_export)
        print(f"[HILUX] Exported Component '{filename}' ({count} meshes)")
        
    # 3. Export Modular Assembly Studio Stages (public/models/modular_parts/pickup/)
    pickup_parts_public = os.path.join(PUBLIC_PARTS, "pickup")
    pickup_parts_export = os.path.join(EXPORTS_PARTS, "pickup")
    os.makedirs(pickup_parts_public, exist_ok=True)
    os.makedirs(pickup_parts_export, exist_ok=True)

    def export_mesh_names(stage_name, name_filter_fn):
        for o in bpy.data.objects:
            o.select_set(False)
        count = 0
        for o in bpy.data.objects:
            if o.type == 'MESH' and name_filter_fn(o):
                o.select_set(True)
                count += 1
        if count > 0:
            stage_pub = os.path.join(pickup_parts_public, f"{stage_name}.glb")
            stage_exp = os.path.join(pickup_parts_export, f"{stage_name}.glb")
            bpy.ops.export_scene.gltf(
                filepath=stage_pub,
                export_format='GLB',
                use_selection=True,
                export_apply=True,
                export_yup=True
            )
            shutil.copyfile(stage_pub, stage_exp)
            print(f"[HILUX] Exported Assembly Stage '{stage_name}.glb' ({count} meshes)")

    # Stage 1: chassis
    export_mesh_names("chassis", lambda o: any(col.name == "01_Chassis_Frame" for col in o.users_collection))
    
    # Stage 2: engine
    export_mesh_names("engine", lambda o: any(col.name == "10_Powertrain_Interior" for col in o.users_collection) and ("Engine" in o.name or "ValveCover" in o.name or "Turbo" in o.name or "Radiator" in o.name or "Ancillaries" in o.name or "Exhaust" in o.name))
    
    # Stage 3: gearbox
    export_mesh_names("gearbox", lambda o: any(col.name == "10_Powertrain_Interior" for col in o.users_collection) and ("Transmission" in o.name or "Driveshaft" in o.name))
    
    # Stage 4: suspension
    export_mesh_names("suspension", lambda o: any(col.name == "08_Suspension_Brakes" for col in o.users_collection) and o.name.startswith("SUSP_"))
    
    # Stage 5: brakes
    export_mesh_names("brakes", lambda o: any(col.name == "09_Wheels_Tires" for col in o.users_collection) and o.name.startswith("BRAKE_"))
    
    # Stage 6: wheels
    export_mesh_names("wheels", lambda o: any(col.name == "09_Wheels_Tires" for col in o.users_collection) and (o.name.startswith("WHEEL_") or o.name.startswith("TIRE_")))
    
    # Stage 7: body_framework
    export_mesh_names("body_framework", lambda o: any(col.name == "02_Cab_Body" for col in o.users_collection))
    
    # Stage 8: exterior_panels
    export_mesh_names("exterior_panels", lambda o: (
        any(col.name == "03_Cargo_Bed" for col in o.users_collection) or
        o.name in ["FASCIA_FrontBumper_Upper", "FASCIA_FrontBumper_Lower", "FASCIA_FrontSkidPlate", "FASCIA_GrilleHeaderBar", "FASCIA_GrilleSlats", "FASCIA_ToyotaEmblem", "REAR_Bumper_Step"]
    ))
    
    # Stage 9: lighting_glass
    export_mesh_names("lighting_glass", lambda o: (
        any(col.name in ["07_Greenhouse_Glazing", "06_Exterior_Hardware"] for col in o.users_collection) or
        (o.name.startswith("LIGHT_") and any(col.name in ["04_Front_Fascia_Lighting", "05_Rear_Fascia_Lighting"] for col in o.users_collection))
    ))
    
    # Complete stage & aliases
    complete_stage_pub = os.path.join(pickup_parts_public, "complete.glb")
    complete_stage_exp = os.path.join(pickup_parts_export, "complete.glb")
    shutil.copyfile(complete_public, complete_stage_pub)
    shutil.copyfile(complete_public, complete_stage_exp)
    
    # Also mirror Car_Pickup_Complete.glb
    pickup_complete_pub = os.path.join(PUBLIC_MODELS, "Car_Pickup_Complete.glb")
    pickup_complete_exp = os.path.join(EXPORTS_DIR, "Car_Pickup_Complete.glb")
    shutil.copyfile(complete_public, pickup_complete_pub)
    shutil.copyfile(complete_public, pickup_complete_exp)
    print(f"[HILUX] Mirrored Car_Pickup_Complete.glb to {pickup_complete_pub}")

    print("[HILUX] Dual-Mode & Assembly Stage GLB Export completed successfully.")
