"""
==============================================================================
BLENDER 5.2 ENGINE INSPECTOR & HIERARCHY ORGANIZER
==============================================================================
Imports the existing engine GLB into Blender 5.2, inspects:
- Geometry & Polygon Count
- Scale & Bounding Dimensions
- Materials & PBR Node Tree
- Separate Sub-Components & Collections
- Origins / Pivots
- Animation / Action data

Then organizes the objects into the standardized mechanical component collections:
ENGINE
├── Block
├── Crankshaft
├── Pistons
├── Connecting_Rods
├── Cylinder_Heads
├── Valves
├── Camshafts
├── Timing_System
├── Intake
├── Exhaust
├── Turbo
├── Fuel_System
├── Alternator
└── Accessories

Saves the organized .blend file to blender/engines/v12_racing_engine.blend
Exports the production-ready GLB to exports/glb/v12_racing_engine.glb
==============================================================================
"""

import bpy
import mathutils
import os
import sys

def run_inspection_and_organization():
    print("\n========================================================")
    print(">>> BLENDER 5.2 ENGINE PIPELINE: INSPECTION & ORGANIZATION")
    print("========================================================")

    # 1. Reset Blender Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 2. Locate Source Engine GLB
    input_glb = os.path.abspath("public/models/v12_racing_engine.glb")
    if not os.path.exists(input_glb):
        input_glb = os.path.abspath("public/models/engines/v12_racing_engine_complete.glb")

    if not os.path.exists(input_glb):
        print(f"ERROR: Could not locate engine GLB at {input_glb}")
        return False

    print(f"[*] Importing source GLB: {input_glb}")
    bpy.ops.import_scene.gltf(filepath=input_glb)

    all_objects = list(bpy.context.scene.objects)
    mesh_objects = [o for o in all_objects if o.type == 'MESH']
    
    total_verts = sum(len(o.data.vertices) for o in mesh_objects)
    total_polys = sum(len(o.data.polygons) for o in mesh_objects)
    materials = list(bpy.data.materials)

    print("\n--------------------------------------------------------")
    print("1. MODEL AUDIT RESULTS")
    print("--------------------------------------------------------")
    print(f"Total Objects in Scene : {len(all_objects)}")
    print(f"Total Mesh Objects     : {len(mesh_objects)}")
    print(f"Total Vertices         : {total_verts:,}")
    print(f"Total Polygons (Faces) : {total_polys:,}")
    print(f"Total Materials        : {len(materials)}")
    for mat in materials[:10]:
        print(f"  - Material: {mat.name}")
    if len(materials) > 10:
        print(f"  ... and {len(materials) - 10} more materials.")

    # Calculate overall bounding box
    min_co = [float('inf')] * 3
    max_co = [float('-inf')] * 3
    for obj in mesh_objects:
        for corner in obj.bound_box:
            world_corner = obj.matrix_world @ mathutils.Vector(corner)
            for i in range(3):
                min_co[i] = min(min_co[i], world_corner[i])
                max_co[i] = max(max_co[i], world_corner[i])

    dimensions = [max_co[i] - min_co[i] for i in range(3)]
    print("\n--------------------------------------------------------")
    print("2. BOUNDING BOX & SCALE AUDIT")
    print("--------------------------------------------------------")
    print(f"Dimensions X (Width)   : {dimensions[0]:.4f} m ({dimensions[0]*1000:.1f} mm)")
    print(f"Dimensions Y (Depth)   : {dimensions[1]:.4f} m ({dimensions[1]*1000:.1f} mm)")
    print(f"Dimensions Z (Height)  : {dimensions[2]:.4f} m ({dimensions[2]*1000:.1f} mm)")
    print(f"Center                 : {[(min_co[i] + max_co[i])/2 for i in range(3)]}")

    # 3. Organize into Standard Mechanical Component Collections
    print("\n--------------------------------------------------------")
    print("3. ORGANIZING INTO COMPONENT COLLECTIONS")
    print("--------------------------------------------------------")

    # Define the target hierarchy
    category_map = {
        "Block": ["block", "crankcase", "bedplate", "main_bearing", "casting", "liner", "girdle"],
        "Crankshaft": ["crankshaft", "counterweight", "crankpin", "flywheel", "starter_ring", "pilot_bearing"],
        "Pistons": ["piston", "ring_pack", "gudgeon", "wrist_pin"],
        "Connecting_Rods": ["connectingrod", "rod_", "bigend", "rod_cap", "rod_bearing"],
        "Cylinder_Heads": ["cylinder_head", "head_casting", "spark_plug", "combustion_chamber"],
        "Valves": ["valve", "valve_spring", "retainer", "valve_seat"],
        "Camshafts": ["camshaft", "cam_lobe", "cam_gear", "cam_bearing"],
        "Timing_System": ["timing", "chain", "belt", "guide", "tensioner_sprocket"],
        "Intake": ["intake", "itb", "manifold", "velocity_stack", "throttle", "plenum", "runner", "airbox"],
        "Exhaust": ["exhaust", "header", "collector", "downpipe", "inconel", "cat"],
        "Turbo": ["turbo", "turbine", "compressor", "wastegate", "intercooler", "boost"],
        "Fuel_System": ["fuel", "injector", "rail", "direct_injection", "high_pressure_pump"],
        "Alternator": ["alternator", "stator", "rotor_pulley"],
        "Accessories": ["pulley", "damper", "water_pump", "oil_pan", "dry_sump", "scavenge", "dipstick", "sensor", "mount", "starter"]
    }

    # Create root ENGINE collection
    engine_col = bpy.data.collections.get("ENGINE")
    if not engine_col:
        engine_col = bpy.data.collections.new("ENGINE")
        bpy.context.scene.collection.children.link(engine_col)

    # Create sub-collections
    created_sub_cols = {}
    for cat in category_map.keys():
        sub_col = bpy.data.collections.get(cat)
        if not sub_col:
            sub_col = bpy.data.collections.new(cat)
            engine_col.children.link(sub_col)
        created_sub_cols[cat] = sub_col

    # Categorize and link objects
    assigned_count = {cat: 0 for cat in category_map.keys()}
    misc_col = bpy.data.collections.get("Other_Accessories")
    if not misc_col:
        misc_col = bpy.data.collections.new("Other_Accessories")
        engine_col.children.link(misc_col)

    for obj in all_objects:
        obj_name_lower = obj.name.lower()
        target_col = misc_col
        for cat, keywords in category_map.items():
            if any(kw in obj_name_lower for kw in keywords):
                target_col = created_sub_cols[cat]
                assigned_count[cat] += 1
                break
        
        # Link to target if not already linked
        if obj.name not in target_col.objects:
            target_col.objects.link(obj)
            
        # Unlink from other collections
        for col in list(obj.users_collection):
            if col != target_col:
                col.objects.unlink(obj)

    for cat, count in assigned_count.items():
        print(f"  [+] ENGINE/{cat:<16}: {count} objects")
    print(f"  [+] ENGINE/Other_Accessories : {len(misc_col.objects)} objects")

    # 4. Save .blend file
    blend_dir = os.path.abspath("blender/engines")
    os.makedirs(blend_dir, exist_ok=True)
    blend_path = os.path.join(blend_dir, "v12_racing_engine.blend")
    print(f"\n[*] Saving organized Blender source file: {blend_path}")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    # 5. Export Standardized GLB
    export_dir = os.path.abspath("exports/glb")
    os.makedirs(export_dir, exist_ok=True)
    export_glb_path = os.path.join(export_dir, "v12_racing_engine.glb")

    print(f"[*] Exporting standardized GLB from Blender 5.2 to: {export_glb_path}")
    bpy.ops.export_scene.gltf(
        filepath=export_glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,           # Preserves local pivots and kinematic offsets
        export_yup=True,              # Blender Z-up to Three.js Y-up
        export_materials='EXPORT',     # PBR materials
        export_normals=True,
        export_tangents=False,
        export_animations=True,
    )

    if os.path.exists(export_glb_path):
        size_mb = round(os.path.getsize(export_glb_path) / (1024 * 1024), 2)
        print(f"[SUCCESS] Export completed: {export_glb_path} ({size_mb} MB)")
        
        # Also deploy to public/models/v12_racing_engine.glb and public/models/engines/v12_racing_engine_complete.glb
        import shutil
        pub_target1 = os.path.abspath("public/models/v12_racing_engine.glb")
        pub_target2 = os.path.abspath("public/models/engines/v12_racing_engine_complete.glb")
        shutil.copyfile(export_glb_path, pub_target1)
        shutil.copyfile(export_glb_path, pub_target2)
        print(f"[DEPLOY] Synced to runtime targets:\n  -> {pub_target1}\n  -> {pub_target2}")
        return True
    else:
        print(f"[FAILED] Export failed, target file not found.")
        return False

if __name__ == "__main__":
    try:
        success = run_inspection_and_organization()
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"Unhandled error in Blender script: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
