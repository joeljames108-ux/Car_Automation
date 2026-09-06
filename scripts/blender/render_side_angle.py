"""
==============================================================================
CINEMATIC AUTOMOTIVE STUDIO RENDERER — SIDE PROFILE VIEW
==============================================================================
Positions an 85mm telephoto camera directly lateral (+X Driver side) to showcase:
- True executive 3-box sedan silhouette & roofline curvature
- Precision wheelbase alignment and wheel-arch stance
- Flush door handles, character crease lines, and rocker panel skirts
- Window surround chrome framing and gloss black B-pillar appliques
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

# Enforce pure smooth curvature shading
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

# 3. Camera Setup: 85mm Telephoto Direct Side Profile
cam_target = bpy.data.objects.new("Cam_Target", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.0, 0.72)

cam_data = bpy.data.cameras.new("Studio_Camera_Side")
cam_data.lens = 85
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0

cam_obj = bpy.data.objects.new("Studio_Camera_Side", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
# Telephoto side elevation
cam_obj.location = (6.8, 0.0, 1.25)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

bpy.context.scene.camera = cam_obj

# 4. Softbox Studio Lighting for Side Profile
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

# Broad overhead light for shoulder crease streak
add_area_light("Light_Ceiling_Softbox", (0.0, 0.0, 4.8), (0, 0, 0), energy=2400, size_x=7.0, size_y=3.5, color=(0.98, 0.99, 1.0))

# Lateral Key Light (soft broad side illumination)
add_area_light("Light_Side_Key", (5.5, 0.0, 2.2), (0, math.radians(25), math.radians(-90)), energy=1200, size_x=5.5, size_y=2.0, color=(1.0, 0.98, 0.96))

# Front Rim Fill
add_area_light("Light_Front_Fill", (3.5, 4.5, 2.0), (math.radians(-30), math.radians(20), math.radians(-45)), energy=600, size_x=3.0, size_y=2.0, color=(0.92, 0.96, 1.0))

# Rear Rim Fill
add_area_light("Light_Rear_Fill", (3.5, -4.5, 2.0), (math.radians(30), math.radians(20), math.radians(-135)), energy=600, size_x=3.0, size_y=2.0, color=(0.95, 0.97, 1.0))

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
render_filepath = os.path.join(out_dir, "sedan_render_side.png")
scene.render.filepath = render_filepath

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True

print("[RENDER] Starting side profile render pass with Cycles...")
bpy.ops.render.render(write_still=True)
print(f"[STATUS] Side render completed successfully: {render_filepath}")
