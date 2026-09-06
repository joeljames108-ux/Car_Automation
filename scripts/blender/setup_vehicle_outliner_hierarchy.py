"""
============================================================================
VEHICLE OUTLINER HIERARCHY & MODELING PIPELINE GENERATOR (BLENDER SCRIPT)
============================================================================
Automates the creation of production vehicle collection hierarchies, mirror
modifier workflows, panel seam vertex groups, and material-driven shader passes.

Hierarchy:
  Car_[Category]_Master
  ├── 00_Reference (Blueprints, Empties)
  ├── 01_Body_Main (Primary Painted Surfaces)
  ├── 02_Bumpers_Aero (Fascias & Trim)
  ├── 03_Glass_Greenhouse (Transparent Shader Pass)
  ├── 04_Lighting (Emissive / Reflective Housing)
  ├── 05_Exterior_Hardware (Trim, Mirrors & Seals)
  └── 06_Running_Gear (Wheels & Underbody)

Usage:
  blender -b -P scripts/blender/setup_vehicle_outliner_hierarchy.py -- --category sedan
============================================================================
"""

import sys
import argparse

try:
    import bpy
    import mathutils
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False
    print("[INFO] Running outside Blender environment. Mock/CLI mode active.")


# 7 Standard Outliner Collections and Descriptions
COLLECTIONS_SPEC = [
    ("00_Reference", "Reference blueprints, coordinate datum, and empties", False, False),
    ("01_Body_Main", "Primary painted exterior sheet metal and carbon panels", True, True),
    ("02_Bumpers_Aero", "Front/rear bumper fascias, grilles, diffusers, and spoilers", True, True),
    ("03_Glass_Greenhouse", "Transparent greenhouse glazing with alpha transmission", True, True),
    ("04_Lighting", "Projector headlamps, LED DRLs, lenses, and rear optic housings", True, True),
    ("05_Exterior_Hardware", "Aerodynamic side mirrors, door handles, wipers, and weatherstrips", True, True),
    ("06_Running_Gear", "Wheels, performance tires, calipers, rotors, and splash liners", True, True),
]

# Standard Node Templates per Collection
NODE_TEMPLATES = {
    "00_Reference": [
        {"name": "REF_Blueprint_Top", "type": "EMPTY", "empty_draw_type": "IMAGE"},
        {"name": "REF_Blueprint_Side", "type": "EMPTY", "empty_draw_type": "IMAGE"},
        {"name": "REF_Blueprint_Front", "type": "EMPTY", "empty_draw_type": "IMAGE"},
        {"name": "REF_Blueprint_Rear", "type": "EMPTY", "empty_draw_type": "IMAGE"},
        {"name": "REF_Origin_Empty", "type": "EMPTY", "empty_draw_type": "ARROWS"},
    ],
    "01_Body_Main": [
        {"name": "GEO_Hood", "seams": ["VG_PanelSeam_Front", "VG_PanelSeam_Bumper_Front"], "mirror": True},
        {"name": "GEO_Roof", "seams": [], "mirror": True},
        {"name": "GEO_Trunk", "seams": ["VG_PanelSeam_Trunk", "VG_PanelSeam_Bumper_Rear"], "mirror": True},
        {"name": "GEO_Fender_Front.L", "seams": ["VG_PanelSeam_Front", "VG_PanelSeam_A_Pillar", "VG_PanelSeam_Door_Front", "VG_PanelSeam_Bumper_Front"], "mirror": True},
        {"name": "GEO_QuarterPanel_Rear.L", "seams": ["VG_PanelSeam_Door_Rear", "VG_PanelSeam_Trunk", "VG_PanelSeam_Bumper_Rear"], "mirror": True},
        {"name": "GEO_Door_Front.L", "seams": ["VG_PanelSeam_Door_Front", "VG_PanelSeam_Door_B_Pillar", "VG_PanelSeam_Rocker"], "mirror": True},
        {"name": "GEO_Door_Rear.L", "seams": ["VG_PanelSeam_Door_B_Pillar", "VG_PanelSeam_Door_Rear", "VG_PanelSeam_Rocker"], "mirror": True},
        {"name": "GEO_RockerPanel.L", "seams": ["VG_PanelSeam_Rocker"], "mirror": True},
    ],
    "02_Bumpers_Aero": [
        {"name": "GEO_Bumper_Front", "seams": ["VG_PanelSeam_Bumper_Front"], "mirror": True},
        {"name": "GEO_Bumper_Rear", "seams": ["VG_PanelSeam_Bumper_Rear"], "mirror": True},
        {"name": "GEO_Grille_Upper", "seams": [], "mirror": True},
        {"name": "GEO_Grille_Lower", "seams": [], "mirror": True},
        {"name": "GEO_Diffuser_Rear", "seams": [], "mirror": True},
        {"name": "GEO_Spoiler_Trunk", "seams": [], "mirror": True},
    ],
    "03_Glass_Greenhouse": [
        {"name": "GEO_Windshield", "seams": [], "mirror": True, "shader": "glass"},
        {"name": "GEO_Rear_Backlight", "seams": [], "mirror": True, "shader": "glass"},
        {"name": "GEO_DoorWindow_Front.L", "seams": [], "mirror": True, "shader": "glass"},
        {"name": "GEO_DoorWindow_Rear.L", "seams": [], "mirror": True, "shader": "glass"},
        {"name": "GEO_QuarterWindow.L", "seams": [], "mirror": True, "shader": "glass"},
    ],
    "04_Lighting": [
        {"name": "GEO_Headlight_Housing.L", "seams": [], "mirror": True, "shader": "housing"},
        {"name": "GEO_Headlight_Lens.L", "seams": [], "mirror": True, "shader": "lens"},
        {"name": "GEO_Taillight_Housing.L", "seams": [], "mirror": True, "shader": "housing"},
        {"name": "GEO_Taillight_Lens.L", "seams": [], "mirror": True, "shader": "lens"},
        {"name": "GEO_Foglight.L", "seams": [], "mirror": True, "shader": "lens"},
        {"name": "GEO_CHMSL", "seams": [], "mirror": False, "shader": "emissive"},
    ],
    "05_Exterior_Hardware": [
        {"name": "GEO_Mirror_Housing.L", "seams": [], "mirror": True, "shader": "gloss_black"},
        {"name": "GEO_Mirror_Glass.L", "seams": [], "mirror": True, "shader": "mirror_glass"},
        {"name": "GEO_DoorHandle_Front.L", "seams": [], "mirror": True, "shader": "gloss_black"},
        {"name": "GEO_DoorHandle_Rear.L", "seams": [], "mirror": True, "shader": "gloss_black"},
        {"name": "GEO_Wiper_Arm.L", "seams": [], "mirror": False, "shader": "matte_trim"},
        {"name": "GEO_Antenna_Roof", "seams": [], "mirror": False, "shader": "gloss_black"},
        {"name": "GEO_Window_Trim_Rubber", "seams": [], "mirror": True, "shader": "rubber"},
    ],
    "06_Running_Gear": [
        {"name": "GEO_Wheel_Rim_Front.L", "seams": [], "mirror": False, "shader": "alloy"},
        {"name": "GEO_Wheel_Tire_Front.L", "seams": [], "mirror": False, "shader": "rubber"},
        {"name": "GEO_Brake_Caliper_Front.L", "seams": [], "mirror": False, "shader": "caliper"},
        {"name": "GEO_Brake_Rotor_Front.L", "seams": [], "mirror": False, "shader": "rotor"},
        {"name": "GEO_WheelArch_Liner_Front.L", "seams": [], "mirror": True, "shader": "matte_trim"},
        {"name": "GEO_Underbody_Shield", "seams": [], "mirror": True, "shader": "matte_trim"},
    ],
}


def get_or_create_collection(name, parent_collection=None):
    """Safely retrieves or creates a collection under a parent."""
    if not IN_BLENDER:
        return None

    if name in bpy.data.collections:
        col = bpy.data.collections[name]
    else:
        col = bpy.data.collections.new(name)

    target_parent = parent_collection if parent_collection else bpy.context.scene.collection
    if col.name not in target_parent.children:
        target_parent.children.link(col)

    return col


def get_or_create_material(name, shader_type="painted_surface"):
    """Creates a configured PBR material suited for automotive rendering."""
    if not IN_BLENDER:
        return None

    if name in bpy.data.materials:
        return bpy.data.materials[name]

    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    nodes.clear()

    node_out = nodes.new(type="ShaderNodeOutputMaterial")
    node_out.location = (400, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    links.new(bsdf.outputs["BSDF"], node_out.inputs["Surface"])

    # Configure based on shader type
    if shader_type == "glass":
        # Screen-space refractive glass
        bsdf.inputs["Roughness"].default_value = 0.02
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 1.0
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 1.0
        mat.blend_method = "BLEND"
        mat.shadow_method = "NONE"
    elif shader_type == "lens":
        bsdf.inputs["Roughness"].default_value = 0.05
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.85
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.85
        mat.blend_method = "BLEND"
    elif shader_type == "emissive":
        bsdf.inputs["Emission Color"].default_value = (1.0, 0.1, 0.05, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 8.0
    elif shader_type == "alloy":
        bsdf.inputs["Metallic"].default_value = 0.95
        bsdf.inputs["Roughness"].default_value = 0.22
    elif shader_type == "rubber":
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.85
        bsdf.inputs["Metallic"].default_value = 0.0
    elif shader_type == "gloss_black":
        bsdf.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.08
    elif shader_type == "mirror_glass":
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.01
    else:  # painted_surface
        bsdf.inputs["Base Color"].default_value = (0.85, 0.08, 0.1, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.8
        bsdf.inputs["Roughness"].default_value = 0.25

    return mat


def setup_vehicle_outliner_scene(category="sedan"):
    """
    Main orchestrator: builds the complete Outliner hierarchy, instantiates
    template mesh nodes, links mirror modifiers, and assigns seam vertex groups.
    """
    if not IN_BLENDER:
        print(f"[MOCK] Initialized vehicle outliner hierarchy for '{category}'.")
        return {"category": category, "collections": [c[0] for c in COLLECTIONS_SPEC]}

    cat_title = category.capitalize()
    master_name = f"Car_{cat_title}_Master"

    print(f"=======================================================")
    print(f"  BUILDING BLENDER OUTLINER HIERARCHY: {master_name}")
    print(f"=======================================================")

    # 1. Create Master Root Collection
    master_col = get_or_create_collection(master_name)

    # 2. Build 7 Sub-Collections
    created_cols = {}
    for col_id, desc, is_render, is_export in COLLECTIONS_SPEC:
        sub_col = get_or_create_collection(col_id, parent_collection=master_col)
        created_cols[col_id] = sub_col
        print(f"  ✓ Collection linked: {col_id} ({desc})")

    # 3. Create / Locate Central Origin Empty in 00_Reference
    ref_col = created_cols["00_Reference"]
    origin_empty_name = "REF_Origin_Empty"
    if origin_empty_name in bpy.data.objects:
        origin_empty = bpy.data.objects[origin_empty_name]
    else:
        origin_empty = bpy.data.objects.new(origin_empty_name, None)
        origin_empty.empty_display_type = "ARROWS"
        origin_empty.empty_display_size = 1.0
        origin_empty.location = (0.0, 0.0, 0.0)
        ref_col.objects.link(origin_empty)
    print(f"  ✓ Origin Empty verified at (0,0,0): {origin_empty.name}")

    # 4. Populate Template Mesh Nodes
    created_objects = []
    for col_id, nodes in NODE_TEMPLATES.items():
        target_col = created_cols[col_id]
        for node_info in nodes:
            node_name = node_info["name"]

            # Avoid re-creating if exists
            if node_name in bpy.data.objects:
                obj = bpy.data.objects[node_name]
            else:
                if node_info.get("type") == "EMPTY":
                    obj = bpy.data.objects.new(node_name, None)
                    obj.empty_display_type = node_info.get("empty_draw_type", "IMAGE")
                else:
                    # Create mesh datablock
                    mesh = bpy.data.meshes.new(f"{node_name}_Mesh")
                    obj = bpy.data.objects.new(node_name, mesh)

                target_col.objects.link(obj)

            # Assign Mirror Modifier if specified
            if node_info.get("mirror") and origin_empty:
                mod_name = "Mirror_Symmetry"
                if mod_name not in obj.modifiers:
                    mod = obj.modifiers.new(name=mod_name, type="MIRROR")
                    mod.mirror_object = origin_empty
                    mod.use_clip = True
                    mod.use_mirror_u = True
                    mod.use_mirror_vertex_groups = True

            # Assign Seam Vertex Groups
            for seam_group in node_info.get("seams", []):
                if seam_group not in obj.vertex_groups:
                    obj.vertex_groups.new(name=seam_group)

            # Assign Material
            shader_key = node_info.get("shader", "painted_surface")
            mat = get_or_create_material(f"M_{shader_key.capitalize()}", shader_type=shader_key)
            if mat and len(obj.data.materials) == 0 if hasattr(obj, "data") and hasattr(obj.data, "materials") else False:
                obj.data.materials.append(mat)

            created_objects.append(obj.name)

    print(f"\n=======================================================")
    print(f"  SUCCESSFULLY GENERATED {len(created_objects)} OUTLINER NODES")
    print(f"  Master Collection: {master_name}")
    print(f"=======================================================")

    return {
        "master": master_name,
        "category": category,
        "objectCount": len(created_objects),
    }


def export_vehicle_outliner_glb(filepath, category="sedan", include_collision=False):
    """
    Exports a clean production GLB adhering to collection filtering rules:
    - Excludes '00_Reference' (blueprints and empties)
    - Excludes 'COL_*' collision meshes unless explicitly requested
    - Preserves exact node names (.L / .R) and material PBR graphs
    """
    if not IN_BLENDER:
        print(f"[MOCK] Exported vehicle GLB to {filepath}")
        return True

    cat_title = category.capitalize()
    master_name = f"Car_{cat_title}_Master"

    # Deselect all
    bpy.ops.object.select_all(action="DESELECT")

    exportable_count = 0
    for obj in bpy.data.objects:
        # Check if in master collection tree
        in_scene = any(col.name == master_name or col.name in [c[0] for c in COLLECTIONS_SPEC] for col in obj.users_collection)
        if not in_scene:
            continue

        # Filter out 00_Reference
        if any(col.name == "00_Reference" for col in obj.users_collection):
            continue

        # Filter out COL_ collision meshes if visual pass
        if obj.name.startswith("COL_") and not include_collision:
            continue

        # Filter out empties
        if obj.type != "MESH":
            continue

        obj.select_set(True)
        exportable_count += 1

    if exportable_count == 0:
        print(f"[WARNING] No exportable mesh objects selected for GLB export.")
        return False

    print(f"[EXPORT] Exporting {exportable_count} geometry nodes to: {filepath}")
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        use_selection=True,
        export_format="GLB",
        export_apply=False, # Retain mirror modifiers if dynamic, or set True for baked export
        export_materials="EXPORT",
    )
    print(f"[SUCCESS] Clean GLB export completed.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vehicle Outliner Hierarchy Generator")
    parser.add_argument("--category", type=str, default="sedan", choices=["sedan", "hatchback", "crossover", "suv"], help="Vehicle Platform Category")
    parser.add_argument("--export", type=str, default="", help="Optional filepath to export GLB")

    # In Blender, sys.argv contains blender options before '--'
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = argv[1:]

    args, _ = parser.parse_known_args(argv)

    result = setup_vehicle_outliner_scene(category=args.category)
    if args.export:
        export_vehicle_outliner_glb(args.export, category=args.category)
