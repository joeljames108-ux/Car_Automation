"""
Bus Dual-Mode GLB Serialization Pipeline (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import os
import shutil

BUS_DIR = os.path.dirname(os.path.abspath(__file__))
BLENDER_DIR = os.path.dirname(BUS_DIR)
SCRIPTS_DIR = os.path.dirname(BLENDER_DIR)
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
if not os.path.exists(os.path.join(PROJECT_DIR, "public")):
    PROJECT_DIR = r"E:\Car_Automation"

PUBLIC_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
PUBLIC_VEHICLES_BUS_DIR = os.path.join(PROJECT_DIR, "public", "vehicles", "bus")
PUBLIC_FAMILIES_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicle_families")
PUBLIC_FAMILIES_COMPONENTS_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "components")
PUBLIC_FAMILIES_COMPLETE_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "complete")
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports", "glb")

for d in [
    PUBLIC_MODELS_DIR, PUBLIC_VEHICLES_BUS_DIR,
    PUBLIC_FAMILIES_DIR, PUBLIC_FAMILIES_COMPONENTS_DIR, PUBLIC_FAMILIES_COMPLETE_DIR,
    EXPORTS_DIR
]:
    os.makedirs(d, exist_ok=True)

def safe_copy(src, dst):
    """Safely copy files even if watched by dev servers."""
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst):
            try:
                os.remove(dst)
            except Exception:
                pass
        shutil.copyfile(src, dst)
    except Exception as e:
        try:
            with open(src, 'rb') as f_in:
                data = f_in.read()
            with open(dst, 'wb') as f_out:
                f_out.write(data)
        except Exception as e2:
            print(f"Warning writing to {dst}: {e2}")

def export_all():
    print("=" * 70)
    print("[BUS_EXPORT] SERIALIZING PRODUCTION BUS GLB ARTIFACTS...")
    print("=" * 70)

    for d in [
        PUBLIC_MODELS_DIR, PUBLIC_VEHICLES_BUS_DIR,
        PUBLIC_FAMILIES_DIR, PUBLIC_FAMILIES_COMPONENTS_DIR, PUBLIC_FAMILIES_COMPLETE_DIR,
        EXPORTS_DIR
    ]:
        os.makedirs(d, exist_ok=True)

    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    # ------------------------------------------------------------------------
    # 1. UNIFIED COMPLETE BUS EXPORT
    # ------------------------------------------------------------------------
    print("[BUS_EXPORT] Exporting Complete Assembled Bus GLB...")
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objects:
        o.select_set(True)
    root = bpy.data.objects.get("ROOT_BUS")
    if root:
        root.select_set(True)
        bpy.context.view_layer.objects.active = root
        
    complete_target_1 = os.path.join(PUBLIC_VEHICLES_BUS_DIR, "complete-bus.glb")
    complete_target_2 = os.path.join(PUBLIC_FAMILIES_COMPLETE_DIR, "complete_bus.glb")
    complete_target_3 = os.path.join(EXPORTS_DIR, "bus_complete.glb")
    complete_target_4 = os.path.join(PUBLIC_MODELS_DIR, "Car_Bus_Complete.glb")

    bpy.ops.export_scene.gltf(
        filepath=complete_target_1,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_draco_mesh_compression_enable=False
    )
    print(f" -> Exported: {complete_target_1} ({os.path.getsize(complete_target_1):,} bytes)")
    
    safe_copy(complete_target_1, complete_target_2)
    safe_copy(complete_target_1, complete_target_3)
    safe_copy(complete_target_1, complete_target_4)
    print(f" -> Synchronized to: {complete_target_4}")
    
    # ------------------------------------------------------------------------
    # 2. DISCRETE ARCHITECTURE PACKAGE EXPORTS (Modular Vehicle Studio)
    # ------------------------------------------------------------------------
    package_groups = {
        "chassis.glb": [o for o in mesh_objects if o.name.startswith("CHASSIS_") or o.name.startswith("POWERTRAIN_") or o.name.startswith("SUSP_")],
        "body-framework.glb": [o for o in mesh_objects if o.name.startswith("BODY_") or o.name.startswith("DOOR_") or o.name.startswith("GLASS_") or o.name.startswith("LIGHT_") or o.name.startswith("HARDWARE_")],
        "floor.glb": [o for o in mesh_objects if "Floor" in o.name or "Deck" in o.name],
        "wheel-arches.glb": [o for o in mesh_objects if "WheelArch" in o.name],
        "hardpoints.glb": [o for o in mesh_objects if o.name.startswith("WHEEL_") or o.name.startswith("BRAKE_")],
        "envelopes.glb": [o for o in mesh_objects if "Monocoque_Shell" in o.name]
    }

    for fname, objs in package_groups.items():
        if not objs:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        
        target_path = os.path.join(PUBLIC_VEHICLES_BUS_DIR, fname)
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
            export_draco_mesh_compression_enable=False
        )
        print(f" -> Exported package component: {target_path} ({os.path.getsize(target_path):,} bytes)")

    # ------------------------------------------------------------------------
    # 3. VEHICLE FAMILY COMPONENTS (body_bus.glb, platform_heavy_duty_bus.glb)
    # ------------------------------------------------------------------------
    family_components = {
        "body_bus.glb": [o for o in mesh_objects if o.name.startswith("BODY_") or o.name.startswith("DOOR_") or o.name.startswith("GLASS_") or o.name.startswith("LIGHT_") or o.name.startswith("HARDWARE_")],
        "platform_heavy_duty_bus.glb": [o for o in mesh_objects if o.name.startswith("CHASSIS_") or o.name.startswith("POWERTRAIN_") or o.name.startswith("SUSP_") or o.name.startswith("WHEEL_") or o.name.startswith("BRAKE_")]
    }
    
    for fname, objs in family_components.items():
        if not objs:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        
        target_path = os.path.join(PUBLIC_FAMILIES_COMPONENTS_DIR, fname)
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
            export_draco_mesh_compression_enable=False
        )
        print(f" -> Exported vehicle family component: {target_path} ({os.path.getsize(target_path):,} bytes)")

    # ------------------------------------------------------------------------
    # 4. MODULAR VEHICLE STUDIO 9-STAGE EXPORTS (public/models/modular_parts/bus)
    # ------------------------------------------------------------------------
    print("\n[BUS_EXPORT] Serializing 9 Modular Assembly Stages for Vehicle Studio...")
    modular_bus_dir = os.path.join(PUBLIC_MODELS_DIR, "modular_parts", "bus")
    exports_bus_dir = os.path.join(PROJECT_DIR, "exports", "parts", "bus")
    os.makedirs(modular_bus_dir, exist_ok=True)
    os.makedirs(exports_bus_dir, exist_ok=True)

    stage_object_rules = {
        "chassis": lambda o: o.name.startswith("CHASSIS_") and not any(k in o.name for k in ["Conduit", "Portal_Axle"]),
        "engine": lambda o: any(k in o.name for k in ["POWERTRAIN_", "CHASSIS_HV_Conduit"]) and not any(k in o.name for k in ["Portal_Axle", "Gearbox"]),
        "gearbox": lambda o: any(k in o.name for k in ["Portal_Axle", "Gearbox", "Reduction", "Differential"]),
        "suspension": lambda o: o.name.startswith("SUSP_"),
        "brakes": lambda o: o.name.startswith("BRAKE_"),
        "wheels": lambda o: o.name.startswith("WHEEL_"),
        "body_framework": lambda o: o.name.startswith("FRAMEWORK_"),
        "exterior_panels": lambda o: (o.name.startswith("BODY_") or o.name.startswith("DOOR_Front_Coach_Lower") or o.name.startswith("DOOR_Front_Coach_Frame") or o.name.startswith("DOOR_Front_Weather") or o.name.startswith("HARDWARE_")) and not any(k in o.name for k in ["Pane", "Glass", "Lens"]),
        "lighting_glass": lambda o: o.name.startswith("GLASS_") or o.name.startswith("LIGHT_") or o.name.startswith("DEST_") or "Window_Pane" in o.name,
    }

    for stage_name, filter_func in stage_object_rules.items():
        matched_objs = [o for o in mesh_objects if filter_func(o)]
        if not matched_objs:
            print(f" [!] Warning: No objects matched for modular stage '{stage_name}'")
            continue
            
        bpy.ops.object.select_all(action='DESELECT')
        for o in matched_objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = matched_objs[0]
        
        for out_dir in [modular_bus_dir, exports_bus_dir]:
            out_file = os.path.join(out_dir, f"{stage_name}.glb")
            bpy.ops.export_scene.gltf(
                filepath=out_file,
                export_format='GLB',
                use_selection=True,
                export_apply=True,
                export_yup=True,
                export_materials='EXPORT',
                export_draco_mesh_compression_enable=False
            )
        print(f" -> Exported modular stage [{stage_name}.glb] with {len(matched_objs)} objects ({os.path.getsize(os.path.join(modular_bus_dir, f'{stage_name}.glb')):,} bytes)")

    # Also synchronize body-framework.glb in public/vehicles/bus with the real skeleton
    framework_mesh_objs = [o for o in mesh_objects if o.name.startswith("FRAMEWORK_")]
    if framework_mesh_objs:
        target_fw = os.path.join(PUBLIC_VEHICLES_BUS_DIR, "body-framework.glb")
        safe_copy(os.path.join(modular_bus_dir, "body_framework.glb"), target_fw)
        print(f" -> Synchronized structural skeleton to {target_fw}")

    print("[BUS_EXPORT] ALL GLB SERIALIZATIONS COMPLETED SUCCESSFULLY.")
