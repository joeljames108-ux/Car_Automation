"""
============================================================================
SEDAN OUTLINER HIERARCHY GENERATOR (BLENDER SCRIPT)
============================================================================
Creates a clean, standardized collection hierarchy for vehicle modeling:
  Car_Sedan_Master
  ├── 00_Reference
  ├── 01_Body_Main
  ├── 02_Bumpers_Aero
  ├── 03_Glass_Greenhouse
  ├── 04_Lighting
  ├── 05_Exterior_Hardware
  └── 06_Running_Gear

Usage inside Blender:
  Run in Blender's Scripting workspace, or execute headless via:
  blender -b -P scripts/blender/build_sedan_outliner_structure.py
============================================================================
"""

try:
    import bpy
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False
    print("[INFO] Running in CLI mode outside Blender. Validating hierarchy schema.")

# Schema: Parent Collection -> Sub-Collections -> Objects to create
CAR_HIERARCHY = {
    "Car_Sedan_Master": {
        "00_Reference": [
            "REF_Blueprint_Top",
            "REF_Blueprint_Side",
            "REF_Blueprint_Front",
            "REF_Blueprint_Rear",
        ],
        "01_Body_Main": [
            "GEO_Hood",
            "GEO_Roof",
            "GEO_Trunk",
            "GEO_Fender_Front.L",
            "GEO_QuarterPanel_Rear.L",
            "GEO_Door_Front.L",
            "GEO_Door_Rear.L",
            "GEO_RockerPanel.L",
        ],
        "02_Bumpers_Aero": [
            "GEO_Bumper_Front",
            "GEO_Bumper_Rear",
            "GEO_Grille_Upper",
            "GEO_Grille_Lower",
            "GEO_Diffuser_Rear",
            "GEO_Spoiler_Trunk",
        ],
        "03_Glass_Greenhouse": [
            "GEO_Windshield",
            "GEO_Rear_Backlight",
            "GEO_DoorWindow_Front.L",
            "GEO_DoorWindow_Rear.L",
            "GEO_QuarterWindow.L",
        ],
        "04_Lighting": [
            "GEO_Headlight_Housing.L",
            "GEO_Headlight_Lens.L",
            "GEO_Taillight_Housing.L",
            "GEO_Taillight_Lens.L",
            "GEO_Foglight.L",
            "GEO_CHMSL",
        ],
        "05_Exterior_Hardware": [
            "GEO_Mirror_Housing.L",
            "GEO_Mirror_Glass.L",
            "GEO_DoorHandle_Front.L",
            "GEO_DoorHandle_Rear.L",
            "GEO_Wiper_Arm.L",
            "GEO_Antenna_Roof",
            "GEO_Window_Trim_Rubber",
        ],
        "06_Running_Gear": [
            "GEO_Wheel_Rim_Front.L",
            "GEO_Wheel_Tire_Front.L",
            "GEO_Brake_Caliper_Front.L",
            "GEO_Brake_Rotor_Front.L",
            "GEO_WheelArch_Liner_Front.L",
            "GEO_Underbody_Shield",
        ],
    }
}

def get_or_create_collection(name, parent_collection=None):
    """Retrieve an existing collection or create and link a new one."""
    if not IN_BLENDER:
        return {"name": name, "children": []}

    if name in bpy.data.collections:
        col = bpy.data.collections[name]
    else:
        col = bpy.data.collections.new(name)
    
    # Link to parent or scene root
    target_parent = parent_collection if parent_collection else bpy.context.scene.collection
    if col.name not in target_parent.children:
        target_parent.children.link(col)
        
    return col

def create_placeholder_mesh(name, target_collection):
    """Create a minimal empty mesh container ready for modeling."""
    if not IN_BLENDER:
        return {"name": name, "type": "MESH"}

    if name in bpy.data.objects:
        return bpy.data.objects[name]
        
    mesh_data = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh_data)
    target_collection.objects.link(obj)
    return obj

def build_sedan_structure():
    """Builds the complete master collection, sub-collections, and placeholder mesh objects."""
    total_objects = 0
    # Build Master Collection under the main Scene Collection
    for master_name, sub_collections in CAR_HIERARCHY.items():
        master_col = get_or_create_collection(master_name)
        
        # Build category sub-collections and inject placeholder meshes
        for sub_name, objects in sub_collections.items():
            sub_col = get_or_create_collection(sub_name, parent_collection=master_col)
            
            for obj_name in objects:
                create_placeholder_mesh(obj_name, sub_col)
                total_objects += 1
                
    print(f"Sedan hierarchy and naming conventions generated successfully ({total_objects} objects created).")
    return total_objects

if __name__ == "__main__":
    # Run generation
    build_sedan_structure()
