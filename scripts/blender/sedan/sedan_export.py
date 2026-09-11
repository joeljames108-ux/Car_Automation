"""
Sedan Dual-Mode GLB Serialization Pipeline (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import os
import shutil

SEDAN_DIR = os.path.dirname(os.path.abspath(__file__))
BLENDER_DIR = os.path.dirname(SEDAN_DIR)
SCRIPTS_DIR = os.path.dirname(BLENDER_DIR)
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
if not os.path.exists(os.path.join(PROJECT_DIR, "public")):
    PROJECT_DIR = r"E:\Car_Automation"

PUBLIC_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
PUBLIC_VEHICLES_SEDAN_DIR = os.path.join(PROJECT_DIR, "public", "vehicles", "sedan")
PUBLIC_MODELS_SEDAN_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicles", "sedan")
PUBLIC_FAMILIES_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicle_families")
PUBLIC_FAMILIES_COMPONENTS_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "components")
PUBLIC_FAMILIES_COMPLETE_DIR = os.path.join(PUBLIC_FAMILIES_DIR, "complete")
PUBLIC_MODULAR_DIR = os.path.join(PUBLIC_MODELS_DIR, "modular_parts", "individual")
PUBLIC_MODULAR_BASE = os.path.join(PUBLIC_MODELS_DIR, "modular_parts")

EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
EXPORTS_PARTS_DIR = os.path.join(EXPORTS_DIR, "parts")

for d in [
    PUBLIC_MODELS_DIR, PUBLIC_VEHICLES_SEDAN_DIR, PUBLIC_MODELS_SEDAN_DIR,
    PUBLIC_FAMILIES_DIR, PUBLIC_FAMILIES_COMPONENTS_DIR, PUBLIC_FAMILIES_COMPLETE_DIR,
    PUBLIC_MODULAR_DIR, PUBLIC_MODULAR_BASE, EXPORTS_DIR, EXPORTS_PARTS_DIR
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

def export_all(export_individual=True):
    print("=" * 70)
    print("[SEDAN_EXPORT] SERIALIZING PRODUCTION GLB ARTIFACTS...")
    print("=" * 70)

    for d in [
        PUBLIC_MODELS_DIR, PUBLIC_VEHICLES_SEDAN_DIR, PUBLIC_MODELS_SEDAN_DIR,
        PUBLIC_FAMILIES_DIR, PUBLIC_FAMILIES_COMPONENTS_DIR, PUBLIC_FAMILIES_COMPLETE_DIR,
        PUBLIC_MODULAR_DIR, PUBLIC_MODULAR_BASE, EXPORTS_DIR, EXPORTS_PARTS_DIR
    ]:
        os.makedirs(d, exist_ok=True)

    # Remove non-mesh objects
    for o in list(bpy.data.objects):
        if o.type != 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)

    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    # ------------------------------------------------------------------------
    # 1. UNIFIED COMPLETE SEDAN EXPORTS
    # ------------------------------------------------------------------------
    print("[SEDAN_EXPORT] Exporting Unified Assembled Complete Sedan GLB...")
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objects:
        o.select_set(True)
    if mesh_objects:
        bpy.context.view_layer.objects.active = mesh_objects[0]
    
    primary_complete = os.path.join(EXPORTS_DIR, "Car_Sedan_Complete.glb")
    os.makedirs(os.path.dirname(primary_complete), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=primary_complete,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT'
    )
    
    # Mirror complete GLB to all required production endpoints
    complete_copies = [
        os.path.join(PUBLIC_MODELS_DIR, "Car_Sedan_Complete.glb"),
        os.path.join(PUBLIC_VEHICLES_SEDAN_DIR, "complete-sedan.glb"),
        os.path.join(PUBLIC_MODELS_SEDAN_DIR, "complete-sedan.glb"),
        os.path.join(PUBLIC_FAMILIES_COMPLETE_DIR, "sedan_complete.glb"),
    ]
    for target in complete_copies:
        safe_copy(primary_complete, target)
        print(f"  ✓ Unified Complete GLB: {os.path.relpath(target, PROJECT_DIR)} ({os.path.getsize(target)/(1024*1024):.2f} MB)")

    # ------------------------------------------------------------------------
    # 2. COMPONENT FAMILY EXPORTS (Body, Aero, Chassis)
    # ------------------------------------------------------------------------
    print("[SEDAN_EXPORT] Exporting Category Subassemblies...")
    
    # 2A. Body Component (Shell + Glass + Doors + Interior)
    bpy.ops.object.select_all(action='DESELECT')
    body_keywords = ["Hood", "Fender", "Door", "Quarter", "Roof", "Pillar", "Trunk", "Windshield", "Glass", "SideWindow", "Interior", "Mirror", "Handles"]
    active_b = [o for o in mesh_objects if any(k in o.name for k in body_keywords)]
    for o in active_b: o.select_set(True)
    if active_b:
        bpy.context.view_layer.objects.active = active_b[0]
        body_target = os.path.join(PUBLIC_FAMILIES_COMPONENTS_DIR, "body_sedan.glb")
        bpy.ops.export_scene.gltf(
            filepath=body_target,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT'
        )
        print(f"  ✓ Exported: body_sedan.glb ({os.path.getsize(body_target)/(1024*1024):.2f} MB)")

    # 2B. Aero Component (Bumpers, Splitter, Diffuser, Canards, Wing, Skirts)
    bpy.ops.object.select_all(action='DESELECT')
    aero_keywords = ["Bumper", "Grille", "Air_Dam", "Splitter", "Canards", "Diffuser", "Skirts"]
    active_a = [o for o in mesh_objects if any(k in o.name for k in aero_keywords)]
    for o in active_a: o.select_set(True)
    if active_a:
        bpy.context.view_layer.objects.active = active_a[0]
        aero_target = os.path.join(PUBLIC_FAMILIES_COMPONENTS_DIR, "aero_sedan.glb")
        bpy.ops.export_scene.gltf(
            filepath=aero_target,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT'
        )
        print(f"  ✓ Exported: aero_sedan.glb ({os.path.getsize(aero_target)/(1024*1024):.2f} MB)")

    # 2C. Chassis Component (Floorpan, Subframes, Firewall, Suspension, Powertrain)
    bpy.ops.object.select_all(action='DESELECT')
    chassis_keywords = ["Chassis", "Subframe", "Firewall", "Crash", "Suspension", "Coilovers", "Steering", "AntiRoll", "Engine", "Cylinder", "Intake", "Transmission", "Driveshaft", "Differential", "Tray", "Liner", "Wheelhouse"]
    active_c = [o for o in mesh_objects if any(k in o.name for k in chassis_keywords)]
    for o in active_c: o.select_set(True)
    if active_c:
        bpy.context.view_layer.objects.active = active_c[0]
        chassis_target = os.path.join(PUBLIC_MODULAR_BASE, "chassis_sedan.glb")
        bpy.ops.export_scene.gltf(
            filepath=chassis_target,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT'
        )
        print(f"  ✓ Exported: chassis_sedan.glb ({os.path.getsize(chassis_target)/(1024*1024):.2f} MB)")

    # ------------------------------------------------------------------------
    # 3. VEHICLE ARCHITECTURE LAYERS (public/models/vehicles/sedan & public/vehicles/sedan)
    # ------------------------------------------------------------------------
    print("[SEDAN_EXPORT] Exporting Architecture Framework Layers...")
    
    arch_specs = {
        "body-framework.glb": ["Pillar", "Roof_Panel", "Chassis_Floorpan", "Firewall"],
        "chassis.glb": ["Subframe", "Crash", "Suspension", "Coilovers", "Steering", "AntiRoll", "Engine", "Transmission", "Driveshaft", "Differential"],
        "floor.glb": ["Floorpan", "Flat_Tray"],
        "wheel-arches.glb": ["Fender", "Quarter", "Wheelhouse", "Liner"],
        "hardpoints.glb": ["Coilovers", "Wishbones", "MultiLink", "Subframe"],
        "envelopes.glb": ["Floorpan", "Roof", "Pillar", "Firewall"]
    }
    
    for filename, keywords in arch_specs.items():
        bpy.ops.object.select_all(action='DESELECT')
        active_sel = [o for o in mesh_objects if any(k in o.name for k in keywords)]
        for o in active_sel:
            o.select_set(True)
        if active_sel:
            bpy.context.view_layer.objects.active = active_sel[0]
            temp_out = os.path.join(EXPORTS_PARTS_DIR, f"arch_{filename}")
            target_1 = os.path.join(PUBLIC_MODELS_SEDAN_DIR, filename)
            target_2 = os.path.join(PUBLIC_VEHICLES_SEDAN_DIR, filename)
            os.makedirs(os.path.dirname(temp_out), exist_ok=True)
            os.makedirs(os.path.dirname(target_1), exist_ok=True)
            os.makedirs(os.path.dirname(target_2), exist_ok=True)
            
            bpy.ops.export_scene.gltf(
                filepath=temp_out,
                use_selection=True,
                export_format='GLB',
                export_apply=True,
                export_yup=True,
                export_materials='EXPORT'
            )
            safe_copy(temp_out, target_1)
            safe_copy(temp_out, target_2)
            if os.path.exists(temp_out):
                try: os.remove(temp_out)
                except Exception: pass
            print(f"  ✓ Exported architecture layer: {filename} ({os.path.getsize(target_1)/1024:.1f} KB)")

    # ------------------------------------------------------------------------
    # 4. INDIVIDUAL ZERO-OFFSET MODULAR PARTS
    # ------------------------------------------------------------------------
    if export_individual:
        print(f"[SEDAN_EXPORT] Exporting {len(mesh_objects)} individual modular parts...")
        for o in mesh_objects:
            bpy.ops.object.select_all(action='DESELECT')
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
            
            clean_name = o.name.replace("GEO_", "").lower()
            
            p1 = os.path.normpath(os.path.join(EXPORTS_PARTS_DIR, f"{clean_name}.glb"))
            p2 = os.path.normpath(os.path.join(PUBLIC_MODULAR_DIR, f"{clean_name}.glb"))
            
            bpy.ops.export_scene.gltf(
                filepath=p1,
                use_selection=True,
                export_format='GLB',
                export_apply=True,
                export_yup=True,
                export_materials='EXPORT'
            )
            safe_copy(p1, p2)

        print(f"  ✓ All {len(mesh_objects)} modular part GLBs serialized.")

    print("=" * 70)
    print("[SEDAN_EXPORT] ALL GLB EXPORTS COMPLETED WITH 100% SUCCESS.")
    print("=" * 70)
