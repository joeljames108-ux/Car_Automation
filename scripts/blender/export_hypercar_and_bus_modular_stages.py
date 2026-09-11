"""
Export Hypercar (Bugatti Divo) & Transit Bus Modular CAD Stages for Vehicle Studio
Exports the exact 9 hardware assembly stages and complete vehicles into:
- public/models/modular_parts/hypercar/
- public/models/modular_parts/divo/
- public/models/modular_parts/bus/
- public/models/modular_parts/bus_shuttle/
- public/models/Car_Hypercar_Complete.glb
- public/models/Car_Bus_Complete.glb
"""

import sys
import os
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))

DIVO_DIR = os.path.join(SCRIPT_DIR, "divo")
BUS_DIR = os.path.join(SCRIPT_DIR, "bus")

for d in [SCRIPT_DIR, DIVO_DIR, BUS_DIR]:
    if d not in sys.path:
        sys.path.insert(0, d)

import bpy
import divo_master_builder
import bus_master_builder

PUBLIC_MODULAR_DIR = os.path.join(PROJECT_DIR, "public", "models", "modular_parts")
PUBLIC_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
EXPORTS_GLB_DIR = os.path.join(PROJECT_DIR, "exports", "glb")

def safe_copy(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        try:
            os.remove(dst)
        except Exception:
            pass
    shutil.copyfile(src, dst)

def export_selected_stage(filepath, mesh_objects, keywords=None, exclude_keywords=None, exact_names=None):
    bpy.ops.object.select_all(action='DESELECT')
    selected = []
    for o in mesh_objects:
        if exact_names and o.name in exact_names:
            selected.append(o)
            continue
        if keywords:
            matches_kw = any(k in o.name for k in keywords)
            matches_ex = any(ex in o.name for ex in exclude_keywords) if exclude_keywords else False
            if matches_kw and not matches_ex:
                selected.append(o)

    if not selected:
        print(f"  [WARN] No objects matched for {os.path.basename(filepath)}")
        return False

    for o in selected:
        o.select_set(True)
    bpy.context.view_layer.objects.active = selected[0]

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_draco_mesh_compression_enable=False
    )
    print(f"  -> Exported {os.path.basename(filepath)} ({len(selected)} objects, {os.path.getsize(filepath):,} bytes)")
    return True

def build_and_export_divo_stages():
    print("=" * 75)
    print("BUILDING & EXPORTING BUGATTI DIVO (HYPERCAR) MODULAR STAGES")
    print("=" * 75)
    
    divo_master_builder.build_complete_divo(export_glbs=True, export_individual=False)
    
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    stage_specs = {
        "chassis": {
            "keywords": ["CHASSIS_Carbon_Monocoque", "CHASSIS_Front_Aluminum", "CHASSIS_Rear_Powertrain_Cradle"]
        },
        "engine": {
            "keywords": ["POWERTRAIN_8L_W16", "POWERTRAIN_W16_Carbon", "POWERTRAIN_QuadTurbo", "POWERTRAIN_Charge_Air", "HARDWARE_W16_Wastegate"]
        },
        "gearbox": {
            "keywords": ["POWERTRAIN_Titanium_Exhaust", "INTERIOR_Carbon_Cockpit_Spine", "INTERIOR_Central_Console"]
        },
        "suspension": {
            "keywords": ["SUSP_Front_Pushrod", "SUSP_Rear_Pushrod"]
        },
        "brakes": {
            "keywords": ["BRAKE_Rotor_", "BRAKE_Caliper_"]
        },
        "wheels": {
            "keywords": ["WHEEL_Tire_", "WHEEL_Rim_", "WHEEL_CenterLock_"]
        },
        "body_framework": {
            "keywords": ["BODY_Divo_Hypercar_Shell", "BODY_Butterfly_Door", "AERO_Bugatti_Atlantic_Center_Dorsal_Fin"]
        },
        "exterior_panels": {
            "keywords": [
                "BODY_Bugatti_Horseshoe", "BODY_Front_Hood_Air_Extractor", "AERO_Front_Carbon_Splitter",
                "AERO_Front_Splitter_Winglet", "AERO_Front_Brake_Air_Curtain", "AERO_Side_Rocker",
                "AERO_Rear_Venturi_Diffuser", "AERO_Diffuser_Vortex_Strake", "AERO_Active_Rear_Wing",
                "HARDWARE_Side_Mirror_Cam", "HARDWARE_Rear_Center_Fuel_Cap", "HARDWARE_Front_S_Duct",
                "HARDWARE_Rear_Brake_Cooling_Louver", "BODY_Roof_NACA_Air_Scoop", "BODY_Side_Intercooler_Air_Scoop"
            ]
        },
        "lighting_glass": {
            "keywords": [
                "LIGHT_Headlight_", "LIGHT_3D_OLED_Taillight_Fin_", "LIGHT_CHMSL_",
                "GLASS_Hypercar_Windshield", "GLASS_Side_Door_Window_", "GLASS_W16_Engine_Cover_Showcase"
            ]
        }
    }

    divo_dest_dirs = [
        os.path.join(PUBLIC_MODULAR_DIR, "hypercar"),
        os.path.join(PUBLIC_MODULAR_DIR, "divo")
    ]

    for stage_id, spec in stage_specs.items():
        primary_file = os.path.join(divo_dest_dirs[0], f"{stage_id}.glb")
        export_selected_stage(primary_file, mesh_objects, keywords=spec.get("keywords"))
        # Mirror to /divo/
        mirror_file = os.path.join(divo_dest_dirs[1], f"{stage_id}.glb")
        safe_copy(primary_file, mirror_file)

    # Complete Divo model
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objects[0]
    
    divo_complete_paths = [
        os.path.join(divo_dest_dirs[0], "complete.glb"),
        os.path.join(divo_dest_dirs[1], "complete.glb"),
        os.path.join(PUBLIC_MODELS_DIR, "Bugatti_Divo_Complete.glb"),
        os.path.join(PUBLIC_MODELS_DIR, "Car_Hypercar_Complete.glb"),
        os.path.join(EXPORTS_GLB_DIR, "bugatti_divo_complete.glb")
    ]
    
    bpy.ops.export_scene.gltf(
        filepath=divo_complete_paths[0],
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_draco_mesh_compression_enable=False
    )
    for p in divo_complete_paths[1:]:
        safe_copy(divo_complete_paths[0], p)
        print(f"  -> Mirrored Complete Divo GLB: {p}")

def build_and_export_bus_stages():
    print("=" * 75)
    print("BUILDING & EXPORTING ELECTRIC TRANSIT BUS MODULAR STAGES")
    print("=" * 75)
    
    bus_master_builder.build_complete_bus()
    
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    bus_stage_specs = {
        "chassis": {
            "keywords": ["CHASSIS_Frame_Rail_", "CHASSIS_Crossmember_", "CHASSIS_Battery_Enclosure_Underfloor", "CHASSIS_Front_Axle_Subframe", "CHASSIS_LowFloor_Passenger_Deck"]
        },
        "engine": {
            "keywords": ["CHASSIS_HV_Conduit_", "BODY_Roof_Battery_Pack_HighVoltage", "CHASSIS_Rear_Portal_Axle_Cradle"]
        },
        "gearbox": {
            "keywords": ["POWERTRAIN_eMotor_DriveUnit_"]
        },
        "suspension": {
            "keywords": ["SUSP_AirBellow_Front_", "SUSP_AirBellow_Rear_"]
        },
        "brakes": {
            "keywords": ["BRAKE_Rotor_", "BRAKE_Caliper_"]
        },
        "wheels": {
            "keywords": ["WHEEL_Tire_", "WHEEL_Rim_", "WHEEL_HubCap_", "WHEEL_DriveHubCap_"]
        },
        "body_framework": {
            "keywords": ["BODY_Transit_Monocoque_Shell", "BODY_Lower_Rocker_Skirting_", "BODY_Side_RubStrip_", "DOOR_Front_BiFold_", "DOOR_Center_BiFold_", "DOOR_ADA_Electric_Ramp", "DOOR_Service_Access_Hatch_"]
        },
        "exterior_panels": {
            "keywords": [
                "BODY_Front_Bumper_", "BODY_Front_Lower_Radiator_", "BODY_Rear_Bumper_", "BODY_Rear_Engine_Cooling_",
                "BODY_Roof_HVAC_", "BODY_Front_Destination_Header_", "BODY_WheelArch_Flare_", "HARDWARE_Side_Mirror_",
                "HARDWARE_Windshield_Wiper_", "HARDWARE_Roof_Emergency_Escape_Hatch_", "HARDWARE_Front_License_Plate_",
                "HARDWARE_Rear_License_Plate_", "HARDWARE_Roof_GPS_", "INTERIOR_Passenger_Seat_", "INTERIOR_Driver_Seat_",
                "INTERIOR_Driver_Dashboard_", "INTERIOR_Steering_", "INTERIOR_FareBox_", "INTERIOR_Overhead_GrabRail_", "INTERIOR_Stanchion_Pole_"
            ]
        },
        "lighting_glass": {
            "keywords": [
                "LIGHT_Destination_Matrix_", "LIGHT_Headlight_", "LIGHT_Front_Turn_Indicator_", "LIGHT_Rear_Taillight_",
                "LIGHT_CHMSL_", "LIGHT_Roof_Clearance_Marker_", "GLASS_Panoramic_Windshield", "GLASS_Windshield_Frit_",
                "GLASS_Side_Passenger_Ribbon_", "GLASS_Pillar_Divider_", "GLASS_Rear_Emergency_Egress_", "GLASS_Driver_Side_Toll_",
                "DOOR_Front_Glass_Pane_", "DOOR_Center_Glass_Pane_"
            ]
        }
    }

    bus_dest_dirs = [
        os.path.join(PUBLIC_MODULAR_DIR, "bus"),
        os.path.join(PUBLIC_MODULAR_DIR, "bus_shuttle")
    ]

    for stage_id, spec in bus_stage_specs.items():
        primary_file = os.path.join(bus_dest_dirs[0], f"{stage_id}.glb")
        export_selected_stage(primary_file, mesh_objects, keywords=spec.get("keywords"))
        mirror_file = os.path.join(bus_dest_dirs[1], f"{stage_id}.glb")
        safe_copy(primary_file, mirror_file)

    # Complete Bus model
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objects:
        o.select_set(True)
    root = bpy.data.objects.get("ROOT_BUS")
    if root:
        root.select_set(True)
        bpy.context.view_layer.objects.active = root
    else:
        bpy.context.view_layer.objects.active = mesh_objects[0]
        
    bus_complete_paths = [
        os.path.join(bus_dest_dirs[0], "complete.glb"),
        os.path.join(bus_dest_dirs[1], "complete.glb"),
        os.path.join(PUBLIC_MODELS_DIR, "Car_Bus_Complete.glb"),
        os.path.join(PUBLIC_MODELS_DIR, "vehicle_families", "complete", "complete_bus.glb"),
        os.path.join(PROJECT_DIR, "public", "vehicles", "bus", "complete-bus.glb"),
        os.path.join(EXPORTS_GLB_DIR, "bus_complete.glb")
    ]
    
    bpy.ops.export_scene.gltf(
        filepath=bus_complete_paths[0],
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_draco_mesh_compression_enable=False
    )
    for p in bus_complete_paths[1:]:
        safe_copy(bus_complete_paths[0], p)
        print(f"  -> Mirrored Complete Bus GLB: {p}")

if __name__ == "__main__":
    build_and_export_divo_stages()
    build_and_export_bus_stages()
    print("=" * 75)
    print("ALL HYPERCAR (DIVO) & BUS MODULAR CAD STAGES EXPORTED SUCCESSFULLY!")
    print("=" * 75)
