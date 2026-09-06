"""
==============================================================================
CINEMATIC AUTOMOTIVE STUDIO RENDERER — REAR 3/4 PERSPECTIVE
==============================================================================
Positions camera at rear 3/4 elevation to showcase:
- Continuous 3D OLED ruby red taillight bar
- Trunk lid deck, aerodynamic spoiler lip, and chrome badging
- Rear diffuser and lower aerodynamic valance
- Muscular rear quarter haunches, C-pillar, and panoramic tinted rear glass
==============================================================================
"""

import bpy
import os
import math

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(PROJECT_DIR, "exports")
os.makedirs(out_dir, exist_ok=True)

# 1. Clean existing lights, camera, studio target, and floor
for obj in list(bpy.data.objects):
    if obj.type in {'CAMERA', 'LIGHT'} or obj.name in {'Cam_Target', 'Studio_Floor', 'Cube'}:
        bpy.data.objects.remove(obj, do_unlink=True)

# 2. Check if car meshes loaded, else import
car_meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in {'Studio_Floor', 'Cube'}]
if not car_meshes:
    glb_path = os.path.join(out_dir, "Car_Sedan_Complete.glb")
    print(f"[RENDER] Importing {glb_path}...")
    bpy.ops.import_scene.gltf(filepath=glb_path)

# Enforce pure smooth curvature shading across all imported vehicle meshes
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.name not in {'Studio_Floor', 'Cube'}:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        if getattr(obj.data, 'has_custom_normals', False):
            try:
                bpy.ops.mesh.customdata_custom_splitnormals_clear()
            except Exception:
                pass
        for p in obj.data.polygons:
            p.use_smooth = True

# 3. Camera Setup: Rear 3/4 Perspective
cam_target = bpy.data.objects.new("Cam_Target", None)
bpy.context.scene.collection.objects.link(cam_target)
# Focus on rear license plate / taillight center
cam_target.location = (0.0, -1.0, 0.75)

cam_data = bpy.data.cameras.new("Studio_Camera_Rear")
cam_data.lens = 55
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0

cam_obj = bpy.data.objects.new("Studio_Camera_Rear", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
# Rear 3/4 elevation
cam_obj.location = (4.3, -4.5, 1.55)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

bpy.context.scene.camera = cam_obj

# 4. Softbox Studio Lighting for Rear
def add_area_light(name, location, rotation, energy, size_x, size_y, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.size = size_x
    light_data.size_y = size_y
    light_data.color = color
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.scene.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    return light_obj

# Rear 3/4 Key Light (broad warm-neutral illumination for rear fascia, trunk, and taillights)
add_area_light("Light_Key_Rear", (3.6, -3.8, 2.4), (math.radians(35), math.radians(20), math.radians(145)), energy=1100, size_x=3.5, size_y=2.0, color=(1.0, 0.98, 0.96))

# Overhead softbox for roofline, rear window, and trunk decklid streaks
add_area_light("Light_Ceiling_Softbox", (0.0, -0.5, 4.5), (0, 0, 0), energy=2200, size_x=6.0, size_y=3.5, color=(0.98, 0.99, 1.0))

# Front Rim Light (outlines the hood and front fender silhouette from behind)
add_area_light("Light_Front_Rim", (-1.5, 4.5, 2.8), (math.radians(-50), math.radians(15), 0), energy=1600, size_x=5.0, size_y=1.5, color=(0.92, 0.96, 1.0))

# Rear Low Diffuser Accent Light
add_area_light("Light_Diffuser_Accent", (1.5, -4.0, 0.6), (math.radians(20), 0, math.radians(170)), energy=350, size_x=2.5, size_y=1.0, color=(0.95, 0.97, 1.0))

# Passenger Side Soft Fill
add_area_light("Light_Passenger_Fill", (-4.2, -1.8, 1.8), (math.radians(25), math.radians(-35), math.radians(-35)), energy=400, size_x=4.0, size_y=2.5, color=(0.90, 0.94, 1.0))

# 5. Reflective Dark Studio Floor
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Studio_Floor"

floor_mat = bpy.data.materials.new("Mat_StudioFloor")
floor_mat.use_nodes = True
bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.012, 0.013, 0.016, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.18
    bsdf.inputs['Metallic'].default_value = 0.20
floor.data.materials.append(floor_mat)

# World background
world = bpy.context.scene.world
if world and world.node_tree:
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.020, 0.022, 0.026, 1.0)
        bg_node.inputs['Strength'].default_value = 0.5

# 6. Render Configuration
scene = bpy.context.scene
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
render_filepath = os.path.join(out_dir, "sedan_render_rear.png")
scene.render.filepath = render_filepath

# Cycles photorealistic pass with CPU denoising
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True

print("[RENDER] Starting rear 3/4 beauty render pass with Cycles...")
bpy.ops.render.render(write_still=True)
print(f"[STATUS] Rear render completed successfully: {render_filepath}")
