"""
==============================================================================
CINEMATIC AUTOMOTIVE STUDIO RENDERER — INTERIOR COCKPIT VIEW
==============================================================================
Positions a 28mm wide-angle camera inside the cabin looking at:
- Driver cockpit, steering wheel, and instrument binnacle
- Center console, gear selector, and central touchscreen display
- Perforated leather front bucket seats and door card trim
- Windshield view from within the cabin
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

# 3. Camera Setup: 28mm Wide Angle Driver Over-Shoulder Cockpit View
cam_target = bpy.data.objects.new("Cam_Target", None)
bpy.context.scene.collection.objects.link(cam_target)
# Target center of dashboard / steering column
cam_target.location = (0.25, 0.70, 0.82)

cam_data = bpy.data.cameras.new("Studio_Camera_Interior")
cam_data.lens = 28
cam_data.clip_start = 0.05
cam_data.clip_end = 50.0

cam_obj = bpy.data.objects.new("Studio_Camera_Interior", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
# Driver's headrest / over-the-shoulder perspective
cam_obj.location = (0.38, -0.25, 1.12)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

bpy.context.scene.camera = cam_obj

# 4. Interior Lighting Setup
def add_point_light(name, location, energy, radius=0.2, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type='POINT')
    light_data.energy = energy
    light_data.shadow_soft_size = radius
    light_data.color = color
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.scene.collection.objects.link(light_obj)
    light_obj.location = location
    return light_obj

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

# Ambient roof glow entering through panoramic glass
add_area_light("Light_Sunroof_Glow", (0.0, 0.2, 2.2), (0, 0, 0), energy=800, size_x=2.0, size_y=1.5, color=(0.95, 0.98, 1.0))

# Cockpit front dash accent fill
add_point_light("Light_Dash_Accent", (0.1, 0.5, 0.9), energy=35, radius=0.3, color=(1.0, 0.95, 0.90))

# Ambient footwell / console light
add_point_light("Light_Console_Glow", (0.0, 0.3, 0.6), energy=20, radius=0.2, color=(0.35, 0.80, 1.0))

# Front windshield soft daylight ingress
add_area_light("Light_Windshield_Daylight", (0.0, 2.8, 1.8), (math.radians(-40), 0, 0), energy=900, size_x=3.0, size_y=1.5, color=(1.0, 0.98, 0.95))

# 5. Render Configuration
scene = bpy.context.scene
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
render_filepath = os.path.join(out_dir, "sedan_render_interior.png")
scene.render.filepath = render_filepath

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True

print("[RENDER] Starting interior cockpit render pass with Cycles...")
bpy.ops.render.render(write_still=True)
print(f"[STATUS] Interior render completed successfully: {render_filepath}")
