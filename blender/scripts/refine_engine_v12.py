"""
==============================================================================
BLENDER 5.2 ENGINE REFINE & OPTIMIZATION PIPELINE
==============================================================================
Imports the 559-object V12 racing engine from blender/backup/original/,
performs non-destructive geometric smoothing and CAD-grade weighted normals,
calibrates all 23 Principled BSDF automotive materials, organizes 14 collections,
saves the master .blend scene, and exports the high-fidelity GLB.
==============================================================================
"""

# pyright: reportMissingImports=false
import bpy
import mathutils
import os
import sys
import shutil

def refine_engine_pipeline():
    print("\n" + "="*70)
    print(">>> STARTING BLENDER 5.2 V12 RACING ENGINE REFINEMENT PIPELINE")
    print("="*70)

    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 2. Source Model Path
    src_glb = os.path.abspath("blender/backup/original/v12_racing_engine_exploded.glb")
    if not os.path.exists(src_glb):
        print(f"[ERROR] Source GLB not found at {src_glb}")
        return False

    print(f"[*] Importing original GLB: {src_glb}")
    bpy.ops.import_scene.gltf(filepath=src_glb)

    all_objects = list(bpy.context.scene.objects)
    mesh_objects = [o for o in all_objects if o.type == 'MESH']
    print(f"[*] Successfully imported {len(all_objects)} objects ({len(mesh_objects)} meshes).")

    # 3. Geometry Smoothing & Weighted Normals
    print("[*] Applying smooth shading and weighted normal modifiers...")
    for obj in mesh_objects:
        # Set smooth shading on all faces
        mesh = obj.data
        if hasattr(mesh, "polygons") and len(mesh.polygons) > 0:
            for poly in mesh.polygons:
                poly.use_smooth = True

        # Add Weighted Normal modifier for crisp CAD bevel reflections
        mod_names = [m.name for m in obj.modifiers]
        if "WeightedNormal" not in mod_names:
            bpy.context.view_layer.objects.active = obj
            try:
                mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
                mod.weight = 50
                mod.keep_sharp = True
            except Exception as e:
                pass

    # 4. PBR Material Calibration
    print("[*] Calibrating 23 Principled BSDF automotive materials...")
    pbr_presets = {
        "aluminum": {"roughness": 0.38, "metallic": 0.88, "specular": 0.5, "clearcoat": 0.15},
        "magnesium": {"roughness": 0.42, "metallic": 0.82, "specular": 0.5, "clearcoat": 0.1},
        "carbon": {"roughness": 0.32, "metallic": 0.05, "specular": 0.6, "clearcoat": 0.75, "clearcoat_roughness": 0.1},
        "twill": {"roughness": 0.32, "metallic": 0.05, "specular": 0.6, "clearcoat": 0.75, "clearcoat_roughness": 0.1},
        "gold": {"roughness": 0.18, "metallic": 0.95, "specular": 0.7, "clearcoat": 0.3},
        "blue": {"roughness": 0.22, "metallic": 0.92, "specular": 0.6, "clearcoat": 0.4},
        "titanium": {"roughness": 0.25, "metallic": 0.90, "specular": 0.6, "clearcoat": 0.3},
        "steel": {"roughness": 0.14, "metallic": 0.96, "specular": 0.6, "clearcoat": 0.2},
        "stainless": {"roughness": 0.20, "metallic": 0.90, "specular": 0.6, "clearcoat": 0.2},
        "rubber": {"roughness": 0.75, "metallic": 0.00, "specular": 0.2, "clearcoat": 0.0},
        "polymer": {"roughness": 0.55, "metallic": 0.08, "specular": 0.4, "clearcoat": 0.1},
        "piston": {"roughness": 0.16, "metallic": 0.94, "specular": 0.6, "clearcoat": 0.25},
        "inconel": {"roughness": 0.28, "metallic": 0.88, "specular": 0.6, "clearcoat": 0.2},
        "cast": {"roughness": 0.45, "metallic": 0.80, "specular": 0.4, "clearcoat": 0.1},
        "bearing": {"roughness": 0.12, "metallic": 0.96, "specular": 0.7, "clearcoat": 0.3},
    }

    for mat in bpy.data.materials:
        if not mat.use_nodes or not mat.node_tree:
            mat.use_nodes = True
        
        nodes = mat.node_tree.nodes
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        
        if bsdf:
            mat_name_lower = mat.name.lower()
            matched_preset = None
            for key, preset in pbr_presets.items():
                if key in mat_name_lower:
                    matched_preset = preset
                    break
            
            if matched_preset:
                # Apply calibrated inputs safely
                if 'Roughness' in bsdf.inputs:
                    bsdf.inputs['Roughness'].default_value = matched_preset["roughness"]
                if 'Metallic' in bsdf.inputs:
                    bsdf.inputs['Metallic'].default_value = matched_preset["metallic"]
                if 'Coat' in bsdf.inputs:  # Blender 4.x / 5.x Principled BSDF
                    bsdf.inputs['Coat'].default_value = matched_preset.get("clearcoat", 0.0)
                elif 'Clearcoat' in bsdf.inputs: # Older naming
                    bsdf.inputs['Clearcoat'].default_value = matched_preset.get("clearcoat", 0.0)

    # 5. Organize into 14 Mechanical Collections
    print("[*] Grouping 559 objects into 14 mechanical collections...")
    collection_rules = [
        ("Block", ["block", "crankcase", "bedplate", "liner", "saddle", "main_bearing", "skirt"]),
        ("Crankshaft", ["crankshaft", "crank", "counterweight", "flywheel", "crankpin", "snout"]),
        ("Pistons", ["piston", "wrist_pin", "gudgeon", "ring_pack", "crown"]),
        ("Connecting_Rods", ["rod", "connecting", "conrod", "rod_cap", "h_beam"]),
        ("Cylinder_Heads", ["head", "cylinder_head", "combustion_chamber", "spark_plug", "dohc"]),
        ("Valves", ["valve", "spring", "retainer", "collet", "seat"]),
        ("Camshafts", ["camshaft", "cam_lobe", "cam_shaft", "cam_gear"]),
        ("Timing_System", ["timing", "sprocket", "chain", "belt", "tensioner", "guide"]),
        ("Intake", ["intake", "manifold", "plenum", "runner", "throttle", "itb", "velocity_stack", "butterfly"]),
        ("Exhaust", ["exhaust", "header", "manifold", "collector", "flange", "inconel"]),
        ("Turbo", ["turbo", "compressor", "turbine", "chra", "wastegate", "blowoff", "intercooler"]),
        ("Fuel_System", ["fuel", "injector", "rail", "pressure_regulator", "line"]),
        ("Alternator", ["alternator", "stator", "rotor", "housing"]),
        ("Accessories", ["pulley", "damper", "pan", "sump", "scavenge", "pump", "bracket", "mount", "sensor"])
    ]

    master_collection = bpy.context.scene.collection
    engine_root_col = bpy.data.collections.new("V12_RACING_ENGINE_REFINED")
    master_collection.children.link(engine_root_col)

    category_cols = {}
    for cat_name, _ in collection_rules:
        c = bpy.data.collections.new(cat_name)
        engine_root_col.children.link(c)
        category_cols[cat_name] = c
    
    misc_col = bpy.data.collections.new("Hardware_And_Fasteners")
    engine_root_col.children.link(misc_col)

    for obj in all_objects:
        obj_name_lower = obj.name.lower()
        assigned = False
        for cat_name, keywords in collection_rules:
            if any(kw in obj_name_lower for kw in keywords):
                category_cols[cat_name].objects.link(obj)
                assigned = True
                break
        if not assigned:
            misc_col.objects.link(obj)

        # Unlink from master root if linked
        if obj.name in master_collection.objects:
            master_collection.objects.unlink(obj)

    # 6. Save Blender Source Scene
    out_blend = os.path.abspath("blender/engines/v12_engine_refined.blend")
    print(f"[*] Saving master refined Blender scene: {out_blend}")
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)

    # 7. Export Standardized GLB
    out_glb = os.path.abspath("exports/glb/v12_racing_engine_refined.glb")
    print(f"[*] Exporting production GLB: {out_glb}")
    os.makedirs(os.path.dirname(out_glb), exist_ok=True)
    
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        export_yup=True,
        export_apply=False, # Preserves uncollapsed local pivots and kinematics!
        export_materials='EXPORT',
        export_animations=True
    )

    # 8. Deploy to Runtime
    runtime_glb = os.path.abspath("public/models/v12_racing_engine.glb")
    shutil.copy2(out_glb, runtime_glb)
    print(f"[SUCCESS] Deployed refined model to runtime: {runtime_glb}")
    
    file_size_mb = round(os.path.getsize(runtime_glb) / (1024 * 1024), 2)
    print(f"[SUMMARY] Output GLB size: {file_size_mb} MB")
    print("="*70)
    print(">>> PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*70 + "\n")
    return True

if __name__ == "__main__":
    refine_engine_pipeline()
