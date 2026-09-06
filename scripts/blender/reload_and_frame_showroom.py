"""
==============================================================================
SHOWROOM FLEET MASTER STAGING & CINEMATIC DISPLAY
==============================================================================
Loads all 5 finalized master vehicles into the active desktop Blender viewport:
- Apex GT3 Supercar     (Center, X = 0.0m, Y = 0.8m)
- Executive Sport Sedan (Mid-Left, X = -3.4m, Y = 0.0m, Yaw = +12 deg)
- Urban Crossover AWD   (Mid-Right, X = +3.4m, Y = 0.0m, Yaw = -12 deg)
- Rally Hot Hatch       (Far-Left, X = -6.8m, Y = -0.8m, Yaw = +22 deg)
- Luxury Full-Size SUV  (Far-Right, X = +6.8m, Y = -0.8m, Yaw = -22 deg)
==============================================================================
"""

import bpy
import math
import os

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")

# 1. Complete robust cleanup
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')

for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for mesh in list(bpy.data.meshes):
    bpy.data.meshes.remove(mesh, do_unlink=True)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)

# 2. Studio Environment Setup
env_col = bpy.data.collections.new("00_Showroom_Environment")
bpy.context.scene.collection.children.link(env_col)

# Studio Floor
bpy.ops.mesh.primitive_plane_add(size=70.0, location=(0.0, 0.0, 0.0))
floor = bpy.context.active_object
floor.name = "Showroom_Floor"
env_col.objects.link(floor)
bpy.context.scene.collection.objects.unlink(floor)

mat_floor = bpy.data.materials.new(name="Showroom_Floor_Material")
mat_floor.use_nodes = True
bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
if bsdf:
    # Deep obsidian showroom floor with mirror reflection
    bsdf.inputs['Base Color'].default_value = (0.025, 0.028, 0.035, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.35
    bsdf.inputs['Roughness'].default_value = 0.16
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 0.6
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = 0.6
floor.data.materials.append(mat_floor)

# Softbox Key Light (Center top)
key_data = bpy.data.lights.new(name="Overhead_Key_Light", type='AREA')
key_data.energy = 8000.0
key_data.size = 24.0
key_data.size_y = 12.0
key_data.color = (1.0, 0.98, 0.95)
key_obj = bpy.data.objects.new(name="Overhead_Key_Light", object_data=key_data)
key_obj.location = (0.0, 2.0, 8.5)
key_obj.rotation_euler = (math.radians(-10), 0, 0)
env_col.objects.link(key_obj)

# Left Side Key Light
left_data = bpy.data.lights.new(name="Left_Side_Light", type='AREA')
left_data.energy = 3500.0
left_data.size = 14.0
left_data.color = (0.95, 0.98, 1.0)
left_obj = bpy.data.objects.new(name="Left_Side_Light", object_data=left_data)
left_obj.location = (-14.0, 4.0, 5.0)
left_obj.rotation_euler = (math.radians(35), math.radians(45), math.radians(-30))
env_col.objects.link(left_obj)

# Right Side Key Light
right_data = bpy.data.lights.new(name="Right_Side_Light", type='AREA')
right_data.energy = 3500.0
right_data.size = 14.0
right_data.color = (0.95, 0.98, 1.0)
right_obj = bpy.data.objects.new(name="Right_Side_Light", object_data=right_data)
right_obj.location = (14.0, 4.0, 5.0)
right_obj.rotation_euler = (math.radians(35), math.radians(-45), math.radians(30))
env_col.objects.link(right_obj)

# Studio Backdrop Wall (Curved infinity backdrop behind vehicles)
bpy.ops.mesh.primitive_plane_add(size=90.0, location=(0.0, -14.0, 8.0))
wall = bpy.context.active_object
wall.name = "Showroom_Backdrop_Wall"
wall.rotation_euler = (math.radians(90), 0, 0)
env_col.objects.link(wall)
bpy.context.scene.collection.objects.unlink(wall)

mat_wall = bpy.data.materials.new(name="Showroom_Wall_Material")
mat_wall.use_nodes = True
wall_bsdf = mat_wall.node_tree.nodes.get("Principled BSDF")
if wall_bsdf:
    wall_bsdf.inputs['Base Color'].default_value = (0.015, 0.018, 0.024, 1.0)
    wall_bsdf.inputs['Roughness'].default_value = 0.85
wall.data.materials.append(mat_wall)

# Showroom Cinematic Camera (Optimized heroic wide view)
cam_data = bpy.data.cameras.new(name="Showroom_Main_Camera")
cam_data.lens = 24.0
cam_data.clip_end = 200.0
cam_obj = bpy.data.objects.new(name="Showroom_Main_Camera", object_data=cam_data)
cam_obj.location = (0.0, 9.6, 1.85)
cam_obj.rotation_euler = (math.radians(84.5), 0, math.radians(180))
env_col.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# 3. Vehicle Specifications
# Note: Since the camera is at +Y looking towards -Y (yaw = 180),
# objects whose native front is +Y will face towards +Y (directly towards the camera)!
# If a model's native front is -Y (like the SUV and Hatchback were facing backwards),
# we add an extra 180 deg yaw so their front grilles face the camera.
CONFIGS = [
    {
        "id": "gt3_supercar",
        "name": "Apex GT3 Supercar",
        "file": "Car_GT3_Supercar_Complete.glb",
        "col_name": "05_Apex_GT3_Supercar",
        "loc": (0.0, 0.8, 0.0),
        "yaw_deg": 0.0,
        "extra_rot_z": 0.0,
    },
    {
        "id": "sedan",
        "name": "Executive Sport Sedan",
        "file": "Car_Sedan_Complete.glb",
        "col_name": "01_Executive_Sedan",
        "loc": (-3.4, 0.0, 0.0),
        "yaw_deg": 12.0,
        "extra_rot_z": 0.0,
    },
    {
        "id": "crossover",
        "name": "Urban Crossover AWD",
        "file": "Car_Crossover_Complete.glb",
        "col_name": "03_Urban_Crossover",
        "loc": (3.4, 0.0, 0.0),
        "yaw_deg": -12.0,
        "extra_rot_z": 0.0,
    },
    {
        "id": "hatchback",
        "name": "Rally Hot Hatch",
        "file": "Car_Hatchback_Complete.glb",
        "col_name": "02_Rally_Hot_Hatch",
        "loc": (-6.8, -0.8, 0.0),
        "yaw_deg": 22.0,
        "extra_rot_z": 0.0,
    },
    {
        "id": "suv",
        "name": "Luxury Full-Size SUV",
        "file": "Car_Suv_Complete.glb",
        "col_name": "04_Luxury_SUV",
        "loc": (6.8, -0.8, 0.0),
        "yaw_deg": -22.0,
        "extra_rot_z": 0.0,
    },
]

def load_vehicle(cfg):
    glb_path = os.path.join(EXPORTS_DIR, cfg["file"])
    if not os.path.exists(glb_path):
        print(f"[ERROR] GLB missing: {glb_path}")
        return

    vcol = bpy.data.collections.new(cfg["col_name"])
    bpy.context.scene.collection.children.link(vcol)

    pre_objs = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    imported = [o for o in bpy.data.objects if o not in pre_objs]

    # Clean any stray icospheres if any exist
    for o in list(imported):
        if "ico" in o.name.lower() or "bounding" in o.name.lower():
            imported.remove(o)
            bpy.data.objects.remove(o, do_unlink=True)

    for o in imported:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        vcol.objects.link(o)

    # Create root pivot empty
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = f"Pivot_{cfg['id']}"
    vcol.objects.link(root)
    bpy.context.scene.collection.objects.unlink(root)

    for o in imported:
        if not o.parent:
            o.parent = root

    total_yaw = math.radians(cfg["yaw_deg"] + cfg["extra_rot_z"])
    root.location = cfg["loc"]
    root.rotation_euler = (0, 0, total_yaw)
    print(f"[STAGED] {cfg['name']} ({len(imported)} parts) at {cfg['loc']} with yaw {math.degrees(total_yaw):.1f} deg.")

def finish_viewport():
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.overlay.show_overlays = False
                        space.shading.type = 'MATERIAL'
                        space.region_3d.view_perspective = 'CAMERA'
    print("=" * 70)
    print("SHOWROOM FLEET STAGED AND READY!")
    print("=" * 70)

if __name__ == "__main__" or "__file__" not in globals():
    for cfg in CONFIGS:
        load_vehicle(cfg)
    finish_viewport()

    render_path = r"C:\Users\joelj\.gemini\antigravity-ide\brain\0c258528-c6a4-4854-b69f-64eac755c0d6\fleet_showroom_master.png"
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.filepath = render_path
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
        if hasattr(scene, "eevee"):
            scene.eevee.taa_render_samples = 32
    except Exception:
        scene.render.engine = 'CYCLES'
        scene.cycles.samples = 32
        scene.cycles.use_denoising = True

    print(f"[RENDER] Engine: {scene.render.engine} | Rendering master showroom image to {render_path}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER] Completed master showroom render!")


