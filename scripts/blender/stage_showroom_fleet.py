"""
==============================================================================
SHOWROOM FLEET STAGING & LIVE BLENDER DISPLAY SCRIPT
==============================================================================
Loads all 5 finalized master vehicle models into the active desktop Blender:
1. Apex GT3 Supercar     (Center, X = 0.0m)
2. Executive Sport Sedan (Mid-Left, X = -3.4m, +8 deg yaw)
3. Urban Crossover AWD   (Mid-Right, X = +3.4m, -8 deg yaw)
4. Hot Hatchback Rally   (Far-Left, X = -6.8m, +15 deg yaw)
5. Luxury Heavy-Duty SUV (Far-Right, X = +6.8m, -15 deg yaw)

Adds high-end studio lighting, reflection floor, and hero studio camera.
==============================================================================
"""

import bpy
import math
import os

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")

VEHICLES = [
    {
        "id": "gt3_supercar",
        "file": "Car_GT3_Supercar_Complete.glb",
        "col_name": "05_Apex_GT3_Supercar",
        "loc": (0.0, 0.5, 0.0),
        "yaw_deg": 0.0,
    },
    {
        "id": "sedan",
        "file": "Car_Sedan_Complete.glb",
        "col_name": "01_Executive_Sedan",
        "loc": (-3.4, 0.0, 0.0),
        "yaw_deg": 8.0,
    },
    {
        "id": "crossover",
        "file": "Car_Crossover_Complete.glb",
        "col_name": "03_Urban_Crossover",
        "loc": (3.4, 0.0, 0.0),
        "yaw_deg": -8.0,
    },
    {
        "id": "hatchback",
        "file": "Car_Hatchback_Complete.glb",
        "col_name": "02_Rally_Hot_Hatch",
        "loc": (-6.8, -0.6, 0.0),
        "yaw_deg": 15.0,
    },
    {
        "id": "suv",
        "file": "Car_Suv_Complete.glb",
        "col_name": "04_Luxury_SUV",
        "loc": (6.8, -0.6, 0.0),
        "yaw_deg": -15.0,
    },
]

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

def setup_studio_environment():
    studio_col = bpy.data.collections.new("00_Studio_Environment")
    bpy.context.scene.collection.children.link(studio_col)

    # Reflective studio showroom floor
    bpy.ops.mesh.primitive_plane_add(size=60.0, location=(0.0, 0.0, 0.0))
    floor = bpy.context.active_object
    floor.name = "Showroom_Stage_Floor"
    studio_col.objects.link(floor)
    bpy.context.scene.collection.objects.unlink(floor)

    mat_floor = bpy.data.materials.new(name="Showroom_Floor_Material")
    mat_floor.use_nodes = True
    bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.04, 0.045, 0.055, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.4
        bsdf.inputs['Roughness'].default_value = 0.18
        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = 0.5
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = 0.5
    floor.data.materials.append(mat_floor)

    # Key Overhead Softbox Light (Center wide)
    key_data = bpy.data.lights.new(name="Key_Softbox", type='AREA')
    key_data.energy = 5000.0
    key_data.size = 18.0
    key_data.size_y = 10.0
    key_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new(name="Key_Softbox", object_data=key_data)
    key_obj.location = (0.0, 1.0, 7.5)
    key_obj.rotation_euler = (math.radians(-15), 0, 0)
    studio_col.objects.link(key_obj)

    # Left Fill Light
    fill_l_data = bpy.data.lights.new(name="Fill_Light_L", type='AREA')
    fill_l_data.energy = 2200.0
    fill_l_data.size = 12.0
    fill_l_data.color = (0.92, 0.96, 1.0)
    fill_l_obj = bpy.data.objects.new(name="Fill_Light_L", object_data=fill_l_data)
    fill_l_obj.location = (-12.0, 4.0, 4.5)
    fill_l_obj.rotation_euler = (math.radians(35), math.radians(45), math.radians(-30))
    studio_col.objects.link(fill_l_obj)

    # Right Fill Light
    fill_r_data = bpy.data.lights.new(name="Fill_Light_R", type='AREA')
    fill_r_data.energy = 2200.0
    fill_r_data.size = 12.0
    fill_r_data.color = (0.92, 0.96, 1.0)
    fill_r_obj = bpy.data.objects.new(name="Fill_Light_R", object_data=fill_r_data)
    fill_r_obj.location = (12.0, 4.0, 4.5)
    fill_r_obj.rotation_euler = (math.radians(35), math.radians(-45), math.radians(30))
    studio_col.objects.link(fill_r_obj)

    # Rim Kicker Light (Behind)
    rim_data = bpy.data.lights.new(name="Rim_Kicker", type='SUN')
    rim_data.energy = 2.5
    rim_data.color = (0.85, 0.92, 1.0)
    rim_obj = bpy.data.objects.new(name="Rim_Kicker", object_data=rim_data)
    rim_obj.rotation_euler = (math.radians(135), math.radians(20), math.radians(40))
    studio_col.objects.link(rim_obj)

    # Showroom Hero Camera
    cam_data = bpy.data.cameras.new(name="Showroom_Hero_Cam")
    cam_data.lens = 38.0
    cam_data.clip_end = 150.0
    cam_obj = bpy.data.objects.new(name="Showroom_Hero_Cam", object_data=cam_data)
    # Position camera in front and slightly elevated for a wide 3/4 panoramic stance
    cam_obj.location = (0.0, 14.5, 3.8)
    cam_obj.rotation_euler = (math.radians(78), 0, math.radians(180))
    studio_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

def import_and_stage_vehicle(veh):
    glb_path = os.path.join(EXPORTS_DIR, veh["file"])
    if not os.path.exists(glb_path):
        print(f"[WARN] GLB not found: {glb_path}")
        return

    print(f"[STAGE] Loading {veh['id']} from {glb_path}...")
    col = bpy.data.collections.new(veh["col_name"])
    bpy.context.scene.collection.children.link(col)

    existing_objs = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    new_objs = [o for o in bpy.data.objects if o not in existing_objs]

    # Organize new objects into vehicle collection
    for o in new_objs:
        for c in o.users_collection:
            c.objects.unlink(o)
        col.objects.link(o)

    # Root empty to rotate & translate the entire vehicle as a unit
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = f"Root_{veh['id']}"
    col.objects.link(root)
    bpy.context.scene.collection.objects.unlink(root)

    for o in new_objs:
        if not o.parent:
            o.parent = root

    root.location = veh["loc"]
    root.rotation_euler = (0, 0, math.radians(veh["yaw_deg"]))
    print(f"[STAGE] Placed {veh['id']} at {veh['loc']} with yaw {veh['yaw_deg']} deg. (Meshes: {len(new_objs)})")

def main():
    print("=" * 70)
    print("STAGING COMPLETE 5-VEHICLE FLEET IN BLENDER")
    print("=" * 70)
    clear_scene()
    setup_studio_environment()
    for veh in VEHICLES:
        import_and_stage_vehicle(veh)
    print("=" * 70)
    print("✅ SHOWROOM FLEET STAGED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
