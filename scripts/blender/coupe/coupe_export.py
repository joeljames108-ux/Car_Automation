"""
Bentley Continental GT II Coupe (2011) Multi-Destination GLB Export (Blender 5.2 LTS)
Exports complete car assembly to target web runtime paths.
"""

import bpy
import os

EXPORT_PATHS = [
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\Car_Coupe_Complete.glb",
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_coupe_gt.glb",
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\vehicle_grand_tourer_coupe.glb",
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\vehicle_families\complete\complete_coupe.glb",
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\vehicles\coupe\complete-coupe.glb",
    r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\exports\Car_Coupe_Complete.glb",
]


def export_all_destinations():
    """
    Export the entire Continental GT assembly to all relevant frontend asset directories.
    """
    # Deselect all, then select all vehicle mesh/curve/empty objects
    for obj in bpy.data.objects:
        obj.select_set(True)
        
    primary_exported = False
    for path in EXPORT_PATHS:
        dir_name = os.path.dirname(path)
        os.makedirs(dir_name, exist_ok=True)
        
        print(f"[COUPE_EXPORT] Exporting GLB -> {path} ...")
        try:
            bpy.ops.export_scene.gltf(
                filepath=path,
                export_format='GLB',
                use_selection=True,
                export_apply=True,
                export_materials='EXPORT',
                export_cameras=False,
                export_lights=False,
                export_yup=True
            )
            file_size_kb = os.path.getsize(path) / 1024.0
            print(f"[COUPE_EXPORT] Successfully exported {path} ({file_size_kb:.1f} KB)")
            primary_exported = True
        except Exception as e:
            print(f"[COUPE_EXPORT] Error exporting {path}: {e}")
            
    # Modular individual stages export
    modular_dir = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\modular_parts\coupe"
    exports_dir = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\exports\parts\coupe"
    os.makedirs(modular_dir, exist_ok=True)
    os.makedirs(exports_dir, exist_ok=True)
    
    stage_object_rules = {
        "chassis": {
            "collections": ["01_Coupe_Chassis_Platform"],
        },
        "engine": {
            "collections": ["02_Coupe_Powertrain_Drivetrain"],
            "keywords": ["W12", "Turbocharger", "Intake"],
        },
        "gearbox": {
            "collections": ["02_Coupe_Powertrain_Drivetrain"],
            "keywords": ["Gearbox", "Propshaft", "Differential", "Exhaust", "Silencer", "Muffler"],
        },
        "suspension": {
            "collections": ["03_Coupe_Suspension_Brakes"],
            "keywords": ["SUSP_"],
        },
        "brakes": {
            "collections": ["03_Coupe_Suspension_Brakes"],
            "keywords": ["BRAKE_"],
        },
        "wheels": {
            "collections": ["04_Coupe_Wheels_Tires"],
        },
        "body_framework": {
            "collections": ["05_Coupe_Body_Monocoque"],
        },
        "exterior_panels": {
            "collections": [
                "06_Coupe_Closures_Panels",
                "07_Coupe_Fascia_Aerodynamics",
                "10_Coupe_Exterior_Hardware",
            ],
        },
        "lighting_glass": {
            "collections": [
                "08_Coupe_Glazing_Windows",
                "09_Coupe_Lighting_Optics",
            ],
        },
    }
    
    for stage_name, rule in stage_object_rules.items():
        bpy.ops.object.select_all(action='DESELECT')
        selected = []
        for col_name in rule.get("collections", []):
            col = bpy.data.collections.get(col_name)
            if not col:
                continue
            for o in col.objects:
                if o.type != 'MESH':
                    continue
                kws = rule.get("keywords")
                if kws:
                    if any(kw in o.name for kw in kws):
                        selected.append(o)
                else:
                    selected.append(o)
                    
        if not selected:
            continue
            
        for o in selected:
            o.select_set(True)
        bpy.context.view_layer.objects.active = selected[0]
        
        stage_path = os.path.join(modular_dir, f"{stage_name}.glb")
        export_path = os.path.join(exports_dir, f"{stage_name}.glb")
        
        for out_p in [stage_path, export_path]:
            try:
                bpy.ops.export_scene.gltf(
                    filepath=out_p,
                    export_format='GLB',
                    use_selection=True,
                    export_apply=True,
                    export_materials='EXPORT',
                    export_cameras=False,
                    export_lights=False,
                    export_yup=True
                )
            except Exception as e:
                print(f"[COUPE_EXPORT] Failed to export modular stage {stage_name} to {out_p}: {e}")
        print(f"[COUPE_EXPORT] Exported modular stage {stage_name} with {len(selected)} objects.")
            
    return primary_exported
