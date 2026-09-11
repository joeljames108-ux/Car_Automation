import bpy
import math
import os
from mathutils import Vector, Euler

glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide non-default shifters and wheels
for obj in bpy.data.objects:
    name = obj.name.upper()
    if any(p in name for p in ["SHIFTER_", "STEERING_"]) and not any(k in name for k in ["SHIFTER_AUTO", "STEERING_SPORT_3SPOKE", "STEER_SPORT"]):
        obj.hide_render = True

world = bpy.data.worlds.new("CockpitWorld")
bg = world.node_tree.nodes.get("Background") if world.node_tree else None
if bg:
    bg.inputs["Color"].default_value = (0.35, 0.42, 0.52, 1.0)
    bg.inputs["Strength"].default_value = 0.8
bpy.context.scene.world = world

sun_data = bpy.data.lights.new("SunKey", type='SUN')
sun_data.energy = 3.5
sun_data.color = (1.0, 0.97, 0.92)
sun_obj = bpy.data.objects.new("SunKey", sun_data)
sun_obj.rotation_euler = Euler((math.radians(48), math.radians(16), math.radians(-30)), 'XYZ')
bpy.context.scene.collection.objects.link(sun_obj)

fill_data = bpy.data.lights.new("Fill", type='POINT')
fill_data.energy = 40.0
fill_data.color = (0.9, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Fill", fill_data)
fill_obj.location = Vector((-0.20, -0.40, 0.90))
bpy.context.scene.collection.objects.link(fill_obj)

cam_data = bpy.data.cameras.new("TestCam")
cam_data.clip_start = 0.05
cam_obj = bpy.data.objects.new("TestCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 960
scene.render.resolution_y = 540

candidates = [
    ("test_sport_a.png", Vector((-0.28, -0.85, 0.94)), Vector((0.08, 0.15, 0.60)), 22.0),
    ("test_sport_b.png", Vector((-0.24, -0.88, 0.96)), Vector((0.05, 0.15, 0.60)), 20.0),
    ("test_sport_c.png", Vector((-0.32, -0.82, 0.92)), Vector((0.10, 0.18, 0.58)), 22.0),
    ("test_sport_d.png", Vector((-0.26, -0.92, 0.98)), Vector((0.06, 0.16, 0.62)), 21.0),
]

for filename, cam_loc, cam_target, lens in candidates:
    cam_obj.location = cam_loc
    cam_data.lens = lens
    dir_vec = (cam_target - cam_loc).normalized()
    cam_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
    out_path = os.path.join(out_dir, filename)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {filename}")
