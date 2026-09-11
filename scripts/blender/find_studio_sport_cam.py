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

# Lighting matching the elegant cockpit
world = bpy.data.worlds.new("CockpitWorld")
bg = world.node_tree.nodes.get("Background") if world.node_tree else None
if bg:
    bg.inputs["Color"].default_value = (0.45, 0.55, 0.70, 1.0)
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
    # (name, cam_loc, cam_target, lens)
    ("cand_sport_1.png", Vector((-0.22, -1.15, 0.85)), Vector((-0.02, 0.15, 0.60)), 28.0),
    ("cand_sport_2.png", Vector((-0.28, -1.05, 0.88)), Vector((0.04, 0.15, 0.60)), 26.0),
    ("cand_sport_3.png", Vector((-0.18, -1.25, 0.90)), Vector((-0.02, 0.12, 0.62)), 24.0),
    ("cand_sport_4.png", Vector((-0.24, -0.98, 0.84)), Vector((0.06, 0.18, 0.58)), 24.0),
    ("cand_sport_5.png", Vector((-0.32, -1.10, 0.86)), Vector((0.02, 0.15, 0.62)), 25.0),
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
